require("dotenv").config();
const express = require("express");
const router = express.Router();
let { google } = require("googleapis");
const logger = require("./config/logger");
const moment = require("moment");
const uuid = require("uuid");
const sql = require("./config/sql-database");

module.exports = router;

var connection = sql.connect(); //SQL SET UP

const calendar = google.calendar({
  version: "v3",
  auth: process.env.API_KEY,
});

const people = google.people({
  version: "v1",
});

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);

// GENERAL

// TERMINES

router.post("/getAllScheduledTermines", async (req, res) => {
  const calendars = req.body;
  let scheduledTermines = [];

  for (let i = 0; i < calendars.length; i++) {
    if (calendars[i].google) {
      oauth2Client.setCredentials({
        refresh_token: calendars[i].google,
      });

      const events = await calendar.events.list({
        calendarId: "primary",
        auth: oauth2Client,
        timeMin: moment().toISOString(),
      });
      if (events && events.data) {
        const times = events.data.items.map((i) => {
          return {
            start: moment(i.start.dateTime).add("hour", -1).utc(),
            end: moment(i.end.dateTime).add("hour", -1).utc(),
          };
        });
        // scheduledTermines = scheduledTermines.concat(events.data.items);
        scheduledTermines = scheduledTermines.concat(times);
      }
    }
  }

  res.send(scheduledTermines);
});

router.post("/createAppointment", async (req, res) => {
  oauth2Client.setCredentials({
    refresh_token: req.body.externalCalendar,
  });

  req.body.creator_id = req.body.employee_id;
  req.body.employeeId = req.body.employee_id
    ? req.body.employee_id
    : req.body.employeeId
    ? req.body.employeeId
    : req.user.user.id;

  delete req.body.employee_id;

  if (!req.body.uuid) {
    req.body.uuid = uuid.v4();
  }

  //check if there is closed event in main time

  const events = await calendar.events.list({
    calendarId: "primary",
    auth: oauth2Client,
    timeMin: moment(req.body.StartTime)
      .add("hour", 1)
      .add("milliseconds", 0)
      .toISOString(),
    timeMax: moment(req.body.EndTime)
      .add("hour", 1)
      .add("milliseconds", 0)
      .toISOString(),
  });

  if (events && events.data.items.length === 0) {
    await calendar.events.insert(
      {
        calendarId: "primary",
        auth: oauth2Client,
        requestBody: {
          summary: req.body.Subject,
          description: JSON.stringify(req.body),
          start: {
            dateTime: moment(req.body.StartTime)
              .add("hour", 1)
              .add("milliseconds", 0),
            timeZone: "UTC",
          },
          end: {
            dateTime: moment(req.body.EndTime)
              .add("hour", 1)
              .add("milliseconds", 0),
            timeZone: "UTC",
          },
        },
      },
      (next) => {}
    );
    res.json(req.body.uuid);
  } else {
    res.json(false);
  }
});

//END TERMINE

//#region CLIENT

router.post("/createClient", function (req, res) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    conn.query(
      "select e.google, e.user_id from external_accounts e join booking_config b on e.user_id = b.admin_id where b.booking_link = ?",
      [req.body.booking_link],
      function (err, rows) {
        if (err) {
          logger.log("error", err.sql + ". " + err.sqlMessage);
          res.json(err);
        }

        if (rows && rows.length) {
          oauth2Client.setCredentials({
            refresh_token: rows[0].google,
          });

          const body = {
            names: [
              {
                givenName: req.body.client.firstname,
                familyName: req.body.client.lastname,
              },
            ],
            // genders: [
            //   {
            //     value: req.body.client.gender,
            //   },
            // ],
            // birthdays: [
            //   {
            //     date: {
            //       day: new Date(req.body.client.birthday).getDate(),
            //       month: new Date(req.body.client.birthday).getMonth() + 1,
            //       year: new Date(req.body.client.birthday).getFullYear(),
            //     },
            //   },
            // ],
            emailAddresses: [
              {
                value: req.body.client.email,
              },
            ],
            phoneNumbers: [
              {
                value: req.body.client.internationalNumber,
                canonicalForm: req.body.client.internationalNumber,
              },
            ],
            addresses: [
              {
                city: req.body.city,
                postalCode: req.body.zip,
                streetAddress: req.body.address,
              },
            ],
          };

          people.people.createContact(
            {
              personFields: [
                "metadata",
                "names",
                "emailAddresses",
                "phoneNumbers",
                "addresses",
              ],
              requestBody: body,
              auth: oauth2Client,
            },
            function (err, response) {
              if (response && response.data) {
                const data = {
                  guuid: generateCustomUUID(
                    response.data.resourceName.split("/")[1]
                  ),
                  resourceName: response.data.resourceName,
                  admin_id: rows[0].user_id,
                };
                res.json(data);
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
  });
});

//#endregion

// END GOOGLE

//#region HELP FUNCTIOn
function packStringFromArrayForWhereCondition(
  array,
  arrayField,
  sqlField,
  connective
) {
  let condition = "";
  for (let i = 0; i < array.length; i++) {
    condition +=
      sqlField + " = " + (arrayField ? array[i][arrayField] : array[i]);
    if (i < array.length - 1) {
      condition += " " + connective + " ";
    }
  }
  return condition;
}

function generateCustomUUID(id) {
  const first =
    id.slice(0, 8).length === 8
      ? id.slice(0, 8)
      : id.slice(0, 8) + "0".repeat(8 - id.slice(0, 8).length);
  const second =
    id.slice(9, 12).length == 4
      ? id.slice(9, 12)
      : id.slice(9, 12) + "0".repeat(4 - id.slice(9, 12).length);
  const third =
    id.slice(13, 16).length == 4
      ? id.slice(13, 16)
      : id.slice(13, 16) + "0".repeat(4 - id.slice(13, 16).length);
  const forth =
    id.slice(17, 20).length == 4
      ? id.slice(17, 20)
      : id.slice(17, 20) + "0".repeat(4 - id.slice(17, 20).length);
  const fifth =
    id.slice(21, 30).length === 12
      ? id.slice(21, 30)
      : id.slice(21, 30) + "0".repeat(12 - id.slice(21, 30).length);
  let uuid = first + "-" + second + "-" + third + "-" + forth + "-" + fifth;
  return uuid;
}

//#endregion
