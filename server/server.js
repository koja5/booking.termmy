// const express = require("express");
// const app = require("./providers/config/app");
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

//API
const bookingApi = require("./providers/booking-api");
const googleApi = require("./providers/google-api");
const paymentApi = require("./providers/payment-api");
const mailApi = require("./providers/mail-api");
const mailServer = require("./providers/mail_server/mail-server");
const confirmationApi = require("./providers/confirmation-api");
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
app.use("/api/google", googleApi);
app.use("/api/payment", paymentApi);
app.use("/api/mail-server", mailApi);
app.use("/api/mail-server", mailServer);
app.use("/api/confirmation", confirmationApi);

app.use(express.static(path.join(__dirname, "../client/src")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/src/index.html"));
});

const port = process.env.PORT || "3002";
app.set("port", port);
const server = http.createServer(app);

server.listen(port, () => console.log(`API running on localhost:${port}`));

/*var fs = require("fs");
const cert = fs.readFileSync('/home/termmy/conf/web/ssl.app.termmy.com.crt');
console.log(cert);*/

//chat

//chat END

// AUTOMATE WORK
