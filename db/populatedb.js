require("dotenv").config();
const { Client } = require("pg");
const fs = require("fs/promises");
const path = require("node:path");

const CREATE_TABLES_SQL = [
  `
  CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      title VARCHAR ( 255 ),
      singer_id INTEGER[],
      album_id INTEGER,
      link VARCHAR ( 255 )
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS singers (
      id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      name VARCHAR ( 255 ),
      link VARCHAR ( 255 )
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS albums (
      id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      title VARCHAR ( 255 ),
      release_year INTEGER,
      link VARCHAR ( 255 )
  );
  `,
];

const CONNECTION_STRING = process.argv[2] || process.env.CONNECTION_STRING;

async function createTables(client) {
  for (sql of CREATE_TABLES_SQL) {
    await client.query(sql);
  }
}

async function readInputFile() {
  const response = await fs.readFile(path.join(__dirname, "data.json"));
  return await JSON.parse(response);
}

async function processValues(values) {
  const processedValues = [];
  values.forEach((value) => processedValues.push(`'${value}'`));

  return processedValues.join(",");
}

async function query(client, sql) {
  const { rows } = await client.query(sql);
  return rows[0].id;
}

async function processValuesSongs(entry, client) {
  const processedValues = [];

  for (const field in entry) {
    let fieldValue = "";
    if (field === "album") {
      fieldValue = await query(
        client,
        `SELECT id FROM albums WHERE title='${entry[field]}';`
      );
      fieldValue = `'${fieldValue}'`;
    } else if (field === "singer") {
      if (Array.isArray(entry[field])) {
        const ids = [];
        for (const singer of entry[field]) {
          const id = await query(
            client,
            `SELECT id FROM singers WHERE name='${singer}';`
          );
          ids.push(id);
        }
        fieldValue = `ARRAY [${ids.join(",")}]`;
      } else {
        fieldValue = await query(
          client,
          `SELECT id FROM singers WHERE name='${entry[field]}';`
        );
        fieldValue = `ARRAY [${fieldValue}]`;
      }
    } else {
      fieldValue = `'${entry[field]}'`;
    }
    processedValues.push(fieldValue);
  }

  return processedValues.join(",");
}

async function insertValues(client) {
  try {
    const data = await readInputFile();

    for (const table of ["albums", "singers"]) {
      for (const entry of data[table]) {
        const sql = `
        INSERT INTO ${table} (${Object.keys(entry).join(",")})
        VALUES (${await processValues(Object.values(entry))});
        `;
        await client.query(sql);
      }
    }

    const table = "songs";
    for (const entry of data[table]) {
      const sql = `
      INSERT INTO ${table} (title, singer_id, album_id, link)
      VALUES (${await processValuesSongs(entry, client)});
      `;
      await client.query(sql);
    }
  } catch (err) {
    console.log("Failed to import db base data." + err.message);
  }
}

async function main() {
  console.log("seeding...");
  const client = new Client({
    connectionString: CONNECTION_STRING,
  });
  await client.connect();

  await createTables(client);
  await insertValues(client);

  await client.end();
  console.log("done");
}

main();
