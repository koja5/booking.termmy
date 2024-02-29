require("dotenv").config();
const express = require("express");
const router = express.Router();
const logger = require("./config/logger");
const sql = require("./config/sql-database");
const sendSMS = require("./mail_server/sms-server");

module.exports = router;

var connection = sql.connect();

router.post("/appointmentConfirmation", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    //check if clinic have sms and set confirmation
    conn.query(
      "select s.admin_id, s.count from booking_config b join sms_count s on b.admin_id = s.admin_id where b.booking_link = ? and s.count > 0",
      [req.body.business_link],
      function (err, sms, fields) {
        if (sms.length && sms[0].count) {
          conn.query(
            "select s.config, u.company, u.telephone from sms_reminder_config s join users u on s.admin_id = u.admin_id where s.admin_id = ?",
            [sms[0].admin_id],
            function (err, rows, fields) {
              if (rows.length) {
                const config = JSON.parse(rows[0].config);
                let count = 0;
                if (
                  config.clientImmediatelyReminder.active &&
                  sms[0].count > 0
                ) {
                  count++;
                  sendSMS(
                    rows[0].telephone,
                    config.clientImmediatelyReminder.message
                      .replace("#date", req.body.date)
                      .replace("#time", req.body.time)
                      .replace("#company", rows[0].company)
                  );
                }
                if (
                  config.employeeImmediatelyReminder.active &&
                  sms[0].count > 0
                ) {
                  count++;
                  sendSMS(
                    req.body.telephone,
                    config.employeeImmediatelyReminder.message
                      .replace("#date", req.body.date)
                      .replace("#time", req.body.time)
                      .replace("#company", rows[0].company)
                  );
                }

                sms[0].count -= count;

                conn.query(
                  "update sms_count set count = ? where admin_id = ?",
                  [sms[0].count, sms[0].admin_id],
                  function (err, rows, fields) {
                    conn.release();
                    if (!err) {
                      res.json(true);
                    } else {
                      res.json(false);
                    }
                  }
                );
              } else {
                res.json(false);
              }
            }
          );
        } else {
          conn.release();
          res.json(false);
        }
      }
    );
  });
});
