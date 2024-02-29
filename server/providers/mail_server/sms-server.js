require("dotenv").config();
var nodemailer = require("nodemailer");
var fs = require("fs");
const logger = require("../config/logger");

var smtpTransport = nodemailer.createTransport({
  host: process.env.smtp_host,
  port: process.env.smtp_port,
  secure: false,
  tls: {
    rejectUnauthorized: false,
  },
  auth: {
    user: process.env.smtp_user,
    pass: process.env.smtp_pass,
  },
});

async function sendSMS(phoneNumber, message) {
  var mailOptions = {
    from: '"Termmy"' + process.env.smtp_user,
    to: process.env.SMS_GATEWAY,
    subject: phoneNumber,
    text: message,
  };
  smtpTransport.sendMail(mailOptions, function (error, response) {
    console.log(response);
    if (error) {
      res.send(false);
      logger.log("error", `${req.body.email}: ${error}`);
    } else {
      res.send(true);
      logger.log("info", `Sent SMS to: ${phoneNumber}`);
    }
  });
}

module.exports = sendSMS;
