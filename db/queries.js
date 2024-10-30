const pool = require("./pool");

const SQL_SEARCH_SONG = `
    SELECT songs.id, songs.title, songs.link, albums.title as album, songs.singer_id
    FROM songs
    LEFT JOIN albums
    ON songs.album_id = albums.id
    WHERE songs.id = $1;
`;
const SQL_SEARCH_SINGER = `
    SELECT name
    FROM singers
    WHERE id = $1;
`;

const getSong = async function (musicId) {
  const { rows } = await pool.query(SQL_SEARCH_SONG, [musicId]);
  let songData = rows[0];

  const singer = [];
  for (const singerId of songData["singer_id"]) {
    const { rows } = await pool.query(SQL_SEARCH_SINGER, [singerId]);
    singer.push(rows[0]["name"]);
  }

  delete songData["singer_id"];
  songData = { ...songData, singer };
  return songData;
};
const getAllSongs = async function () {
  const { rows } = await pool.query("SELECT id FROM songs;");

  const songs = [];
  for (const entry of rows) {
    const id = entry["id"];
    const songInfo = await getSong(id);
    songs.push(songInfo);
  }

  return songs;
};
const getAllSingers = async function () {
  const { rows } = await pool.query("SELECT * FROM singers;");
  return rows;
};
const getAllAlbums = async function () {
  const { rows } = await pool.query("SELECt * FROM albums;");
  return rows;
};

module.exports = { getSong, getAllSongs, getAllSingers, getAllAlbums };
