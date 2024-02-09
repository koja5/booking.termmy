require("dotenv").config();
const express = require("express");
const router = express.Router();
const fs = require("fs");
const sha1 = require("sha1");
const request = require("request");
const moment = require("moment");

module.exports = router;

router.post("/sendBookingInfo", function (req, res, next) {
  var body = JSON.parse(
    fs.readFileSync("./providers/mail_server/mail_config/booking.json", "utf-8")
  );

  body["template"] = "booking.hjs";

  body["firstname"] = req.body.personal.firstname;
  body["greeting"] = body.greeting.replace(
    "{firstname}",
    req.body.personal.firstname
  );
  body["lastname"] = req.body.personal.lastname;
  body["birthday"] = moment(req.body.personal.birthday).format("DD.MM.yyyy");
  body["email"] = req.body.personal.email;
  body["phone"] = req.body.personal.phone;
  body["date"] = moment(req.body.calendar.date).format("DD.MM.yyyy");
  body["time"] = moment(req.body.calendar.date).format("HH:mm");
  body["storename"] = req.body.calendar.storename;
  body["street"] = req.body.calendar.street;
  body["place"] = req.body.calendar.place;
  body["store_phone"] = req.body.calendar.store_phone;
  body["store_email"] = req.body.calendar.store_email;

  var options = {
    url: process.env.link_api + "mail-server/sendMail",
    method: "POST",
    body: body,
    json: true,
  };
  request(options, function (error, response, body) {
    if (!error) {
      res.json(true);
    } else {
      res.json(false);
    }
  });
});

router.post("/verifyEmailAddress", function (req, res, next) {
  var body = JSON.parse(
    fs.readFileSync("./providers/mail_server/mail_config/booking.json", "utf-8")
  );

  body["template"] = "verify_email_address.hjs";
  body["email"] = req.body.email;
  body["verified_mail_link"] =
    process.env.link_api + "verifiedMailAndActive/" + sha1(req.body.email);

  var options = prepareOptionsForRequest(body);

  console.log(options);

  request(options, function (error, response, body) {
    if (!error) {
      res.json(true);
    } else {
      res.json(false);
    }
  });
});

router.post("/verifyEmailAddress", function (req, res, next) {
  var body = JSON.parse(
    fs.readFileSync("./providers/mail_server/mail_config/booking.json", "utf-8")
  );

  body["template"] = "verify_email_address.hjs";
  body["email"] = req.body.email;
  body["verified_mail_link"] =
    process.env.link_api + "verifiedMailAndActive/" + sha1(req.body.email);

  var options = prepareOptionsForRequest(body);

  console.log(options);

  request(options, function (error, response, body) {
    if (!error) {
      res.json(true);
    } else {
      res.json(false);
    }
  });
});

router.post("/forgotPasswordLink", function (req, res, next) {
  var body = JSON.parse(
    fs.readFileSync("./providers/mail_server/mail_config/booking.json", "utf-8")
  );

  body["template"] = "reset_password.hjs";
  body["email"] = req.body.email;
  body["forgot_password_link"] =
    process.env.link_client + "auth/reset-password/" + sha1(req.body.email);

  var options = prepareOptionsForRequest(body);

  console.log(options);

  request(options, function (error, response, body) {
    if (!error) {
      res.json(true);
    } else {
      res.json(false);
    }
  });
});

//#region FUNCTIONS

function prepareOptionsForRequest(body) {
  return {
    url: process.env.link_api + "mail-server/sendMail",
    method: "POST",
    body: body,
    json: true,
  };
}

//#endregion
