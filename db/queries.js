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
const getSingerByName = async function (name) {
  const { rows } = await pool.query(
    "SELECT * FROM singers WHERE singers.name ILIKE $1;",
    [name]
  );
  return rows[0];
};
const getAllSingers = async function () {
  const { rows } = await pool.query("SELECT * FROM singers;");
  return rows;
};
const getAlbumByName = async function (title) {
  const { rows } = await pool.query(
    "SELECT * FROM albums WHERE albums.title ILIKE $1;",
    [title]
  );
  return rows[0];
};
const getAllAlbums = async function () {
  const { rows } = await pool.query("SELECT * FROM albums;");
  return rows;
};
const updateSong = async function (songInfo) {
  await pool.query(
    `
    UPDATE songs
    SET title = $1,
    singer_id = $2,
    album_id = $3,
    link = $4
    WHERE id = $5;
    `,
    [
      songInfo.title,
      songInfo.singerId,
      songInfo.albumId,
      songInfo.link,
      songInfo.id,
    ]
  );
};
const updateSinger = async function (singerInfo) {
  await pool.query(
    `
    UPDATE singers
    SET name = $1,
    link = $2
    WHERE id = $3
    ;
    `,
    [singerInfo.name, singerInfo.link, singerInfo.id]
  );
};
const updateAlbum = async function (albumInfo) {
  await pool.query(
    `
      UPDATE albums
      SET title = $1,
      release_year = $2,
      link = $3
      WHERE id = $4
      ;
      `,
    [albumInfo.title, albumInfo.releaseYear, albumInfo.link, albumInfo.id]
  );
};
const addSong = async function (songInfo) {
  await pool.query(
    `
    INSERT INTO songs (title, singer_id, album_id, link)
    VALUES ($1, $2, $3, $4);
    `,
    [songInfo.title, songInfo.singerId, songInfo.albumId, songInfo.link]
  );
};
const deleteSong = async function (songId) {
  await pool.query(
    `
    DELETE FROM songs
    WHERE id = $1;
    `,
    [songId]
  );
};

module.exports = {
  getSong,
  getAllSongs,
  getSingerByName,
  getAllSingers,
  getAlbumByName,
  getAllAlbums,
  updateSong,
  updateSinger,
  updateAlbum,
  addSong,
  deleteSong,
};
