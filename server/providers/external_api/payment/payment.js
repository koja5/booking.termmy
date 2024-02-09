require("dotenv").config();
const express = require("express");
var router = express.Router();
const app = express();
const stripe = require("./stripe");

module.exports = router;

router.use("/stripe", stripe);
