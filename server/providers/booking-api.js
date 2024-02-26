require("dotenv").config();
const express = require("express");
const router = express.Router();
const sql = require("./config/sql-database");
const logger = require("./config/logger");
const uuid = require("uuid");

module.exports = router;

var connection = sql.connect();

connection.getConnection(function (err, conn) {});

/* GET api listing. */
router.get("/", (req, res) => {
  // res.send("api works");
});

//#region GENERAL

router.get("/getBusinessConfig/:id", async (req, res, next) => {
  try {
    connection.getConnection(function (err, conn) {
      if (err) {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "select * from booking_config where booking_link = ?",
          [req.params.id],
          function (err, rows, fields) {
            conn.release();
            if (err) {
              logger.log("error", err.sql + ". " + err.sqlMessage);
              res.json(err);
            } else {
              res.json(rows);
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

//#endregion

//#region SERVICES

router.get("/getServices/:id", async (req, res, next) => {
  try {
    connection.getConnection(function (err, conn) {
      if (err) {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "select s.* from booking_config b join services s on b.admin_id = s.admin_id where b.booking_link = ?",
          [req.params.id],
          function (err, rows, fields) {
            conn.release();
            if (err) {
              logger.log("error", err.sql + ". " + err.sqlMessage);
              res.json(err);
            } else {
              res.json(rows);
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

router.get("/getService/:id", async (req, res, next) => {
  try {
    connection.getConnection(function (err, conn) {
      if (err) {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "select name, price, time_duration from services where id = ?",
          [req.params.id],
          function (err, rows, fields) {
            conn.release();
            if (err) {
              logger.log("error", err.sql + ". " + err.sqlMessage);
              res.json(err);
            } else {
              res.json(rows);
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

//#endregion

//#region EMPLOYEE

router.post("/getAvailableEmployees", async (req, res, next) => {
  try {
    connection.getConnection(function (err, conn) {
      if (err) {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "select u.* from booking_config b join users u on b.admin_id = u.id or b.admin_id = u.admin_id where b.booking_link like ? and (u.location_id = ? or u.location_id is NULL)",
          [req.body.booking_link, req.body.location_id],
          function (err, rows, fields) {
            conn.release();
            if (err) {
              logger.log("error", err.sql + ". " + err.sqlMessage);
              res.json(err);
            } else {
              res.json(rows);
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

router.post("/getExternalCalendarConnections", async (req, res, next) => {
  try {
    connection.getConnection(function (err, conn) {
      if (err) {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        const condition = packStringFromArrayForWhereCondition(
          req.body,
          null,
          "user_id",
          "or"
        );

        conn.query(
          "select user_id, google from external_accounts where google is not null && " +
            condition,
          function (err, rows, fields) {
            conn.release();
            if (err) {
              logger.log("error", err.sql + ". " + err.sqlMessage);
              res.json(err);
            } else {
              res.json(rows);
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

router.get("/getWorkTime/:id", async (req, res, next) => {
  try {
    connection.getConnection(function (err, conn) {
      if (err) {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "select w.* from booking_config b join worktimes w on b.admin_id = w.user_id where b.booking_link = ?",
          [req.params.id],
          function (err, rows, fields) {
            conn.release();
            if (err) {
              logger.log("error", err.sql + ". " + err.sqlMessage);
              res.json(err);
            } else {
              res.json(rows);
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

router.get("/getEmployee/:id", async (req, res, next) => {
  try {
    connection.getConnection(function (err, conn) {
      if (err) {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "select u.id, e.google from users u join external_accounts e on u.id = e.user_id where u.id = ?",
          [req.params.id],
          function (err, rows, fields) {
            conn.release();
            if (err) {
              logger.log("error", err.sql + ". " + err.sqlMessage);
              res.json(err);
            } else {
              res.json(rows);
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

//#endregion

//#region APPOINTMENT

router.post("/getAllScheduledTermines", async (req, res, next) => {
  try {
    connection.getConnection(function (err, conn) {
      if (err) {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        const condition = packStringFromArrayForWhereCondition(
          req.body,
          "id",
          "employee_id",
          "or"
        );

        conn.query(
          "select * from appointments where StartTime >= CURRENT_DATE() and " +
            condition,
          function (err, rows, fields) {
            conn.release();
            if (err) {
              logger.log("error", err.sql + ". " + err.sqlMessage);
              res.json(err);
            } else {
              res.json(rows);
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

router.post("/createAppointment", async (req, res, next) => {
  try {
    connection.getConnection(function (err, conn) {
      if (err) {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        // check if somone made appointment in maintime
        conn.query(
          "select * from appointments where StartTime < ? and EndTime > ? and employee_id = ?",
          [req.body.StartTime, req.body.StartTime, req.body.employee_id],
          function (err, rows, fields) {
            if (err) {
              conn.release();
              logger.log("error", err.sql + ". " + err.sqlMessage);
              res.json(false);
            } else {
              // someone maid appointment in maintime
              if (rows.length) {
                conn.release();
                res.json(false);
              } else {
                req.body.id = uuid.v4();
                conn.query(
                  "insert into appointments SET ?",
                  [req.body],
                  function (err, rows, fields) {
                    conn.release();
                    if (err) {
                      logger.log("error", err.sql + ". " + err.sqlMessage);
                      res.json(false);
                    } else {
                      res.json(req.body.id);
                    }
                  }
                );
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

router.post("/createAppointmentArchive", async (req, res, next) => {
  try {
    connection.getConnection(function (err, conn) {
      if (err) {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        if (!req.body.appointment_id) {
          req.body.appointment_id = uuid.v4();
        }
        conn.query(
          "insert into appointments_archive SET ?",
          [req.body],
          function (err, rows, fields) {
            conn.release();
            if (err) {
              logger.log("error", err.sql + ". " + err.sqlMessage);
              res.json(false);
            } else {
              res.json(req.body.appointment_id);
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

router.get("/getAppointmentArchive/:id", async (req, res, next) => {
  try {
    connection.getConnection(function (err, conn) {
      if (err) {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "select c.firstname, c.lastname, s.name, s.time_duration, s.price, a.StartTime, a.EndTime from appointments_archive a join clients c on a.client_id = c.id join services s on a.service_id = s.id where a.appointment_id = ?",
          [req.params.id],
          function (err, rows, fields) {
            conn.release();
            if (err) {
              logger.log("error", err.sql + ". " + err.sqlMessage);
              res.json(err);
            } else {
              res.json(rows);
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

//#endregion

//#region CLIENT

router.post("/getClient", async (req, res, next) => {
  try {
    connection.getConnection(function (err, conn) {
      if (err) {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "select c.* from clients c join booking_config b on c.admin_id = b.admin_id where (c.email = ? or c.telephone = ?) and b.booking_link = ?",
          [
            req.body.client.email,
            req.body.client.telephone.internationalNumber,
            req.body.booking_link,
          ],
          function (err, rows, fields) {
            if (err) {
              conn.release();
              logger.log("error", err.sql + ". " + err.sqlMessage);
              res.json(err);
            } else {
              if (rows.length) {
                res.json(true);
              } else {
                res.json(false);
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

router.post("/createClient", async (req, res, next) => {
  try {
    connection.getConnection(function (err, conn) {
      if (err) {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        delete req.body.client.description;
        req.body.client.telephone = req.body.client.telephone
          .internationalNumber
          ? req.body.client.telephone.internationalNumber
          : req.body.client.telephone;
        conn.query(
          "select c.* from clients c join booking_config b on c.admin_id = b.admin_id where (c.email = ? or c.telephone = ?) and b.booking_link = ?",
          [
            req.body.client.email,
            req.body.client.telephone,
            req.body.booking_link,
          ],
          function (err, rows, fields) {
            if (err) {
              conn.release();
              logger.log("error", err.sql + ". " + err.sqlMessage);
              res.json(err);
            } else {
              if (rows.length) {
                res.json(rows[0].id);
              } else {
                conn.query(
                  "select * from booking_config where booking_link = ?",
                  [req.body.booking_link],
                  function (err, rows, fields) {
                    if (rows.length) {
                      req.body.client.admin_id = rows[0].admin_id;
                      req.body.client.id = uuid.v4();
                      conn.query(
                        "insert into clients SET ?",
                        [req.body.client],
                        function (err, rows) {
                          conn.release();
                          if (err) {
                            logger.log(
                              "error",
                              err.sql + ". " + err.sqlMessage
                            );
                            res.json(false);
                          } else {
                            res.json(req.body.client.id);
                          }
                        }
                      );
                    } else {
                      conn.release();
                      res.json(false);
                    }
                  }
                );
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

//#endregion

//#region HELPFUL FUNCTIONS
function packStringFromArrayForWhereCondition(
  array,
  arrayField,
  sqlField,
  connective
) {
  let condition = "";
  for (let i = 0; i < array.length; i++) {
    const item = getValue(array, i, arrayField);
    condition += sqlField + " = " + item;
    if (i < array.length - 1) {
      condition += " " + connective + " ";
    }
  }
  return condition;
}

function getValue(array, i, arrayField) {
  const value = arrayField ? array[i][arrayField] : array[i];
  return isNaN(value) ? '"' + value + '"' : value;
}

//#endregion
