const pool = require("./pool");

const SQL_SEARCH_SONG = `
  SELECT songs.id, songs.title, songs.link, albums.title as album, songs.singer_id
  FROM songs
  LEFT JOIN albums
  ON songs.album_id = albums.id
  WHERE songs.id = $1;
`;
const SQL_SEARCH_SINGER = `
  SELECT *
  FROM singers
  WHERE name ILIKE $1;
`;
const SQL_SEARCH_ALBUM = `
  SELECT title, release_year AS releaseYear, link
  FROM albums
  WHERE title ILIKE $1;
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
const getSinger = async function (singerName) {
  const { rows } = await pool.query(SQL_SEARCH_SINGER, [singerName]);
  return rows[0];
};
const getAlbum = async function (albumTitle) {
  const { rows } = await pool.query(SQL_SEARCH_ALBUM, [albumTitle]);
  return rows[0];
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

module.exports = {
  getSong,
  getAllSongs,
  getSinger,
  getAllSingers,
  getAlbum,
  getAllAlbums,
  updateSong,
  updateSinger,
  updateAlbum,
};
