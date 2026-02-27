require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const expect = require("chai");
const socket = require("socket.io");
const cors = require("cors");
const path = require("path");

const { createServer } = require("node:http");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner.js");
const { noCache, noSniff, xssFilter } = require("helmet");
const connections = require("./connections.js");
const app = express();

app.use((req, res, next) => {
  res.setHeader("X-Powered-By", "PHP 7.4.3");
  next();
});

app.use(noCache());
app.use(noSniff());
app.use(xssFilter());

app.use("/public", express.static(path.join(process.cwd(), "public")));
app.use("/assets", express.static(path.join(process.cwd(), "assets")));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({ origin: "*" }));

const server = createServer(app);

const io = socket(server);

// Index page (static HTML)
app.route("/").get(function (req, res) {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

connections(io);

//For FCC testing purposes
fccTestingRoutes(app);

// 404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404).type("text").send("Not Found");
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
server.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV === "test") {
    console.log("Running Tests...");
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log("Tests are not valid:");
        console.error(error);
      }
    }, 1500);
  }
});

module.exports = app; // For testing