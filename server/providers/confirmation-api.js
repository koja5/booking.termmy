require("dotenv").config();
const express = require("express");
const router = express.Router();
const logger = require("./config/logger");
const sql = require("./config/sql-database");
const sendSMS = require("./mail_server/sms-server");

module.exports = router;

var connection = sql.connect();

router.post("/appointmentConfirmation", function (req, res, next) {
  connection.getConnection(async function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    sendConfirmationViaSms(conn, req.body);

    await res.json(true);
  });
});

//#region SEND CONFIRMATION VIA SMS

function sendConfirmationViaSms(conn, body) {
  conn.query(
    "select sc.count, s.config, u.telephone, u.company from booking_config b join users u on b.admin_id = u.admin_id join sms_count sc on b.admin_id = sc.admin_id join sms_reminder_config s on b.admin_id = s.admin_id where b.booking_link = ? and s.active = 1 and sc.count > 0",
    [body.business_link],
    async function (err, rows, fields) {
      if (rows.length) {
        const config = JSON.parse(rows[0].config);
        rows = rows[0];
        const item = {
          date: body.date,
          time: body.time,
          company: rows.company,
          count: rows.count,
        };

        sendViaSms(config, body.telephone, rows.telephone, conn, item);
      }

      await conn.release();
    }
  );
}

function sendViaSms(config, client_telephone, employee_telephone, conn, item) {
  console.log(item);
  if (config.clientImmediatelyReminder.active && item.count) {
    sendSMS(
      client_telephone,
      config.clientImmediatelyReminder.message
        .replace("#date", item.date)
        .replace("#time", item.time)
        .replace("#company", item.company)
    );
    conn.query(
      "update sms_count set count = count - 1 where admin_id = ?",
      [item.admin_id],
      function (err, rows, fields) {}
    );
  }
  setTimeout(() => {
    if (config.employeeImmediatelyReminder.active && item.count) {
      sendSMS(
        employee_telephone,
        config.employeeImmediatelyReminder.message
          .replace("#date", item.date)
          .replace("#time", item.time)
          .replace("#company", item.company)
      );
      conn.query(
        "update sms_count set count = count - 1 where admin_id = ?",
        [item.admin_id],
        function (err, rows, fields) {}
      );
    }
  }, 1000);
}

//#endregion

//#region SEND CONFIRMATION VIA EMAIL

function sendConfirmationViaEmail() {}

//#endregion
