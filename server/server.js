// const express = require("express");
// const app = require("./providers/config/app");
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

//API
const bookingApi = require("./providers/booking-api");
//END API

const sqlDatabase = require("./providers/config/sql-database");
var cors = require("cors");
sqlDatabase.connect();

const express = require("express");
// const express = require("express");

const app = express();

//use cors
app.use(cors({ origin: "*" }));

app.use(express.json());

module.exports = app;

app.use(function (req, res, next) {
  //allow cross origin requests
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, PUT, OPTIONS, DELETE, GET"
  );
  res.header("Access-Control-Allow-Origin", "http://localhost:4201");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

// Parsers for POST data
app.use(bodyParser.json({ limit: "50mb", extended: true }));
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());

//providers
app.use("/api/booking", bookingApi);

app.use(express.static(path.join(__dirname, "../client/src")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/src/index.html"));
});

const port = process.env.PORT || "3002";
app.set("port", port);
const server = http.createServer(app);

server.listen(port, () => console.log(`API running on localhost:${port}`));

//chat

//chat END

// AUTOMATE WORK
