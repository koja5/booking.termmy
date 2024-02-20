require("dotenv").config();
const express = require("express");
const router = express.Router();
let { google } = require("googleapis");
const auth = require("./config/auth");
const logger = require("./config/logger");
const moment = require("moment");

module.exports = router;

const calendar = google.calendar({
  version: "v3",
  auth: process.env.API_KEY,
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
    res.send(true);
  } else {
    res.send(false);
  }
});

//END TERMINE

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

//#endregion
