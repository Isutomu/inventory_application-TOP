const { Router } = require("express");
const controller = require("./controller");

const dbRouter = Router();

dbRouter.get("/", controller.renderHomepage);
dbRouter.get("/songs", controller.getAllSongs);
dbRouter.get("/singers", controller.getAllSingers);
dbRouter.get("/albums", controller.getAllAlbums);
dbRouter.get("/songs/:id", controller.updateSongGet);
dbRouter.post("/songs/:id", controller.updateSongPost);

module.exports = dbRouter;
