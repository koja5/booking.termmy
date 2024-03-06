require("dotenv").config();
const express = require("express");
const router = express.Router();
const fs = require("fs");
const sha1 = require("sha1");
const request = require("request");
const moment = require("moment");
const sql = require("./config/sql-database");
const logger = require("./config/logger");

var connection = sql.connect();

module.exports = router;

router.post("/appointmentConfirmation", function (req, res, next) {
  try {
    connection.getConnection(function (err, conn) {
      if (err) {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "select u.firstname as 'employee_firstname', u.lastname as 'employee_lastname', u.email as 'employee_email', c.firstname as 'client_firstname', c.lastname as 'client_lastname', c.email as 'client_email', s.name as 'service_name', s.time_duration, s.price, a.StartTime, a.EndTime, b.company_name, b.company_address, b.telephone as 'company_telephone', b.email as 'company_email' from appointments a join users u on a.employee_id = u.id join clients c on a.client_id = c.id join services s on a.service_id = s.id join booking_config b on a.admin_id = b.admin_id where a.id = ?",
          [req.body.appointment_id],
          function (err, rows, fields) {
            conn.release();
            if (err) {
              logger.log("error", err.sql + ". " + err.sqlMessage);
              res.json(err);
            } else {
              if (rows.length) {
                var client = JSON.parse(
                  fs.readFileSync(
                    "./providers/mail_server/mail_config/appointment-confirmation-client.json",
                    "utf-8"
                  )
                );

                client = packInformationForMail(client, rows[0]);
                client["email"] = rows[0].client_email;
                client["payment_message"] = req.body.payment_message;
                var client_options = prepareOptionsForRequest(client);

                request(client_options, function (error, response, body) {});

                var employee = JSON.parse(
                  fs.readFileSync(
                    "./providers/mail_server/mail_config/appointment-confirmation-employee.json",
                    "utf-8"
                  )
                );
                employee = packInformationForMail(employee, rows[0]);
                employee["email"] = rows[0].employee_email;
                employee["payment_message"] = req.body.payment_message;
                var employee_options = prepareOptionsForRequest(employee);

                request(employee_options, function (error, response, body) {
                  if (!error) {
                    res.json(true);
                  } else {
                    res.json(false);
                  }
                });
              }
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

function packInformationForMail(body, rows) {
  body["template"] = "appointment_confirmation.hjs";

  body = addNewPropertyToCurrentObject(body, rows);
  body["email"] = rows.employee_email;
  body["date"] = moment(rows.StartTime).format("DD.MM.YYYY");
  body["time"] =
    moment(rows.StartTime).format("HH:mm") +
    " - " +
    moment(rows.StartTime).add(rows.time_duration, "minutes").format("HH:mm");

  return body;
}

//#region FUNCTIONS

function prepareOptionsForRequest(body) {
  return {
    url: process.env.link_api + "mail-server/sendMail",
    method: "POST",
    body: body,
    json: true,
  };
}

function addNewPropertyToCurrentObject(body, properties) {
  for (const [key, value] of Object.entries(properties)) {
    body[key] = value;
  }
  return body;
}

//#endregion
