const asyncHandler = require("express-async-handler");
const queries = require("./db/queries");

const renderHomepage = asyncHandler(async (req, res) => {
  res.render("homepage");
});
const getAllSongs = asyncHandler(async (req, res) => {
  const songs = await queries.getAllSongs();
  res.render("songs", { songs });
});
const getAllSingers = asyncHandler(async (req, res) => {
  const singers = await queries.getAllSingers();
  res.render("singers", { singers });
});
const getAllAlbums = asyncHandler(async (req, res) => {
  const albums = await queries.getAllAlbums();
  res.render("albums", { albums });
});
const updateSongGet = asyncHandler(async (req, res) => {
  const songId = req.params.id;
  const song = await queries.getSong(songId);
  const singers = await queries.getAllSingers();
  const albums = await queries.getAllAlbums();
  res.render("update_song", { song, singers, albums });
});
const updateSongPost = asyncHandler(async (req, res) => {
  const songId = req.params.id;

  const singer =
    typeof req.body.singer == "string" ? [req.body.singer] : req.body.singer;
  const singerIdPromises = singer.map(async (singerName) => {
    const singerInfo = await queries.getSingerByName(singerName);
    return singerInfo["id"];
  });
  const singerId = await Promise.all(singerIdPromises);

  const album = req.body.album;
  const albumInfo = await queries.getAlbumByName(album);
  const albumId = albumInfo["id"];

  await queries.updateSong({
    title: req.body.title,
    singerId,
    albumId,
    link: req.body.link,
    id: songId,
  });
  res.redirect("/");
});
const addSongGet = asyncHandler(async (req, res) => {
  const singers = await queries.getAllSingers();
  const albums = await queries.getAllAlbums();
  res.render("add_song", { singers, albums });
});
const addSongPost = asyncHandler(async (req, res) => {
  const singer =
    typeof req.body.singer == "string" ? [req.body.singer] : req.body.singer;
  const singerIdPromises = singer.map(async (singerName) => {
    const singerInfo = await queries.getSingerByName(singerName);
    return singerInfo["id"];
  });
  const singerId = await Promise.all(singerIdPromises);

  const album = req.body.album;
  const albumInfo = await queries.getAlbumByName(album);
  const albumId = albumInfo["id"];

  await queries.addSong({
    title: req.body.title,
    singerId,
    albumId,
    link: req.body.link,
  });
  res.redirect("/");
});
const deleteSongPost = asyncHandler(async (req, res) => {
  const songId = req.params.id;
  await queries.deleteSong(songId);
  res.redirect("/songs");
});

module.exports = {
  renderHomepage,
  getAllSongs,
  getAllSingers,
  getAllAlbums,
  updateSongGet,
  updateSongPost,
  addSongGet,
  addSongPost,
  deleteSongPost,
};
