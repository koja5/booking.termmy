require("dotenv").config();
const express = require("express");
const app = express();
var router = express.Router();
var request = require("request");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const sql = require("../../config/sql-database");
const auth = require("../../config/auth");

module.exports = router;

var connection = sql.connect();

router.post("/connect", (req, res, next) => {
  stripe.accounts.create(
    {
      country: "US",
      type: "express",
      capabilities: {
        card_payments: {
          requested: true,
        },
        transfers: {
          requested: true,
        },
      },
    },
    (err, charge) => {
      stripe.accountLinks.create(
        {
          account: charge.id,
          refresh_url:
            process.env.link_api +
            "payment/stripe/checkAccount/" +
            charge.id +
            "/" +
            req.body.admin_id,
          return_url:
            process.env.link_api +
            "payment/stripe/checkAccount/" +
            charge.id +
            "/" +
            req.body.admin_id,
          type: "account_onboarding",
          collect: "eventually_due",
        },
        (err, link) => {
          if (link && link.url) {
            res.json(link);
          } else {
            res.json({ url: process.env.link_client + "miscellaneous/error" });
          }
        }
      );
    }
  );
});

router.get("/checkAccount/:stripe/:admin_id", (req, res, next) => {
  stripe.accounts.retrieve(req.params.stripe, (err, account) => {
    if (!err) {
      if (
        account &&
        account.requirements &&
        account.requirements.currently_due.length === 0
      ) {
        const body = {
          stripe: req.params.stripe,
          admin_id: req.params.admin_id,
        };
        var options = {
          rejectUnauthorized: false,
          url: process.env.link_api + "payment/stripe/setExternalStripeAccount",
          method: "POST",
          body: body,
          json: true,
        };
        request(options, function (error, response, body) {
          res.redirect(
            process.env.link_client +
              "dashboard/admin/admin-settings/online-payment"
          );
        });
      } else {
        res.redirect(
          process.env.link_client +
            "dashboard/admin/admin-settings/online-payment"
        );
      }
    } else {
      res.json(false);
    }
  });
});

router.post("/setExternalStripeAccount", function (req, res) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    conn.query(
      "select * from external_accounts_admin where admin_id = ?",
      [req.body.admin_id],
      function (err, rows) {
        if (!err) {
          if (rows.length) {
            conn.query(
              "update external_accounts_admin set ? where admin_id = ?",
              [req.body, req.body.admin_id],
              function (err, rows) {
                conn.release();
                if (!err) {
                  res.json(true);
                } else {
                  logger.log("error", err.sql + ". " + err.sqlMessage);
                  res.json(false);
                }
              }
            );
          } else {
            conn.query(
              "insert into external_accounts_admin SET ?",
              [req.body],
              function (err, rows) {
                conn.release();
                if (!err) {
                  res.json(true);
                } else {
                  logger.log("error", err.sql + ". " + err.sqlMessage);
                  res.json(false);
                }
              }
            );
          }
        } else {
          logger.log("error", err.sql + ". " + err.sqlMessage);
          res.json(false);
        }
      }
    );
  });
});

router.post("/cancelStripeAccount", auth, function (req, res) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    conn.query(
      "update external_accounts_admin set stripe = NULL where admin_id = ?",
      [req.user.user.admin_id],
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(true);
        } else {
          logger.log("error", err.sql + ". " + err.sqlMessage);
          res.json(false);
        }
      }
    );
  });
});
