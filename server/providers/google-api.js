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

//#region TERMINES

router.post("/getAllScheduledTermines", async (req, res) => {
  const calendars = req.body;
  let scheduledTermines = [];

  for (let i = 0; i < calendars.length; i++) {
    if (calendars[i].google) {
      try {
        oauth2Client.setCredentials({
          refresh_token: calendars[i].google,
        });

        const events = await calendar.events.list({
          calendarId: "primary",
          auth: oauth2Client,
          timeMin: moment().toISOString(),
          timeMax: moment().add("weeks", 4).toISOString(),
        });

        if (calendars[i].google_additional_calendars) {
          calendars[i].google_additional_calendars = JSON.parse(
            calendars[i].google_additional_calendars
          );

          for (let key in calendars[i].google_additional_calendars) {
            console.log(calendars[i].google_additional_calendars[key]);
            if (calendars[i].google_additional_calendars[key].active) {
              let eventsFromAdditionalCalendar = await calendar.events.list({
                calendarId: calendars[i].google_additional_calendars[key].id,
                auth: oauth2Client,
                timeMin: moment().toISOString(),
                timeMax: moment().add("weeks", 4).toISOString(),
              });
              events.data.items = events.data.items.concat(
                eventsFromAdditionalCalendar.data.items
              );
            }
          }
        }
        if (events && events.data) {
          console.log("------------------------");
          const times = events.data.items.map((i) => {
            console.log(i);
            let start = null;
            let end = null;
            let allDay = false;
            if (i.dateTime) {
              start = i.dateTime;
            } else if (i.date) {
              start = i.date;
              let allDay = true;
            } else if (i.start && i.end) {
              if (i.start.date) {
                start = i.start.date;
                allDay = true;
              } else if (i.start.dateTime) {
                start = i.start.dateTime;
              }
              if (i.end.date) {
                end = i.end.date;
                allDay = true;
              } else if (i.end.dateTime) {
                end = i.end.dateTime;
              }
            }
            return {
              allDay: allDay,
              start: start,
              end: end,
            };
          });
          // scheduledTermines = scheduledTermines.concat(events.data.items);
          scheduledTermines = scheduledTermines.concat(times);
        }
      } catch (ex) {
        console.log("Credential problem");
      }
    }
  }

  res.send(scheduledTermines);
});

router.post("/createAppointment", async (req, res) => {
  try {
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
      timeMin: moment(req.body.StartTime).add("milliseconds", 0).toISOString(),
      timeMax: moment(req.body.EndTime).add("milliseconds", 0).toISOString(),
    });

    if (events && events.data.items.length === 0) {
      const timeZone = await calendar.calendars.get({
        calendarId: "primary",
        auth: oauth2Client,
      });

      await calendar.events.insert(
        {
          calendarId: "primary",
          auth: oauth2Client,
          requestBody: {
            summary: req.body.Subject,
            description: JSON.stringify(req.body),
            start: {
              dateTime: moment(req.body.StartTime).add("milliseconds", 0),
              timeZone: timeZone.data.timeZone,
            },
            end: {
              dateTime: moment(req.body.EndTime).add("milliseconds", 0),
              timeZone: timeZone.data.timeZone,
            },
          },
        },
        (next) => {}
      );
      res.json(req.body.uuid);
    } else {
      res.json(false);
    }
  } catch (ex) {
    res.json(false);
  }
});

//#endregion TERMINES

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
          try {
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
                  value: req.body.client.telephone.internationalNumber,
                  canonicalForm: req.body.client.telephone.internationalNumber,
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
          } catch (ex) {
            res.json(false);
          }
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
