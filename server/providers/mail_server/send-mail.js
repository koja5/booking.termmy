require("dotenv").config();
var nodemailer = require("nodemailer");
var fs = require("fs");
var hogan = require("hogan.js");
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

// var smtpTransport = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "kidsnodeoffice@gmail.com",
//     pass: "rvciekpadttcvbwt"
//   },
// });

async function sendMail(to, subject, message) {
  if (message.template) {
    var template = fs.readFileSync(
      "./providers/mail_server/templates/" + message.template,
      "utf-8"
    );
    var messageTemplate = hogan.compile(template);
    var mailOptions = {
      from: '"Termmy"' + process.env.smtp_user,
      to: to,
      subject: subject,
      html: messageTemplate.render(message),
    };
  } else {
    var mailOptions = {
      from: '"Termmy"' + process.env.smtp_user,
      to: to,
      subject: subject,
      text: message,
    };
  }
  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      logger.log("error", `${to}: ${error}`);
      return false;
    } else {
      logger.log("info", `Sent mail to: ${to}`);
      return true;
    }
  });
  return true;
}

module.exports = sendMail;
