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

var gatewayCountryPrefix = JSON.parse(
  fs
    .readFileSync(
      "./providers/mail_server/sms_config/gateway-country-prefix.json"
    )
    .toString()
);

async function sendSMS(telephone, message) {
  const to = checkCountryPrefix(telephone);
  if (to) {
    var mailOptions = {
      from: '"Termmy"' + process.env.smtp_user,
      to: process.env.SMS_GATEWAY,
      subject: telephone,
      text: message,
    };
    smtpTransport.sendMail(mailOptions, function (error, response) {
      console.log(response);
      if (error) {
        res.send(false);
        logger.log("error", `${req.body.email}: ${error}`);
      } else {
        res.send(true);
        logger.log("info", `Sent SMS to: ${telephone}`);
      }
    });
  } else {
    logger.log("warn", `Try to send SMS to: ${telephone}`);
  }
}

function checkCountryPrefix(telephone) {
  for (let i = 0; i < gatewayCountryPrefix.length; i++) {
    if (
      telephone.startsWith(gatewayCountryPrefix[i].prefix) &&
      gatewayCountryPrefix[i].active
    ) {
      return gatewayCountryPrefix[i].email;
    }
  }
  return false;
}

module.exports = sendSMS;
