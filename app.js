require("dotenv").config();
const express = require("express");
const path = require("path");
const dbRouter = require("./routes");

const server = express();
const PORT = process.env.PORT || 8080;

server.set("views", path.join(__dirname, "views"));
server.set("view engine", "ejs");
server.use(express.urlencoded({ extended: true }));

server.use("/", dbRouter);

server.listen(PORT, () =>
  console.log(`Server properly initialized on port ${PORT}`)
);
