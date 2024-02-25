require("dotenv").config();
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_KEY);
const Stripe = require("stripe");

module.exports = router;

router.post("/createPaymentIntent", async (req, res, next) => {
  //   const stripe = Stripe(process.env.stripe_key, {
  //     stripeAccount: "acct_1OhSOVPwkZNY6HKT",
  //   });

  const paymentIntent = await require("stripe")(process.env.STRIPE_KEY, {
    stripeAccount: "acct_1OhSOVPwkZNY6HKT",
  }).paymentIntents.create({
    amount: req.body.amount * 100,
    currency: "eur",
  });

  res.json(paymentIntent.client_secret);
});

router.get("/getSecretKey", async (req, res, next) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(
    "pi_3MtwBwLkdIwHu7ix28a3tqPa"
  );

  res.json(paymentIntent);

  // stripe.paymentIntents.create(
  //   {
  //     amount: req.body.price * 100,
  //     currency: "EUR",
  //     description: req.body.description,
  //     automatic_payment_methods: { enabled: true },
  //     application_fee_amount: req.body.price * 100 * 0.01,
  //     confirm: true,
  //     payment_method: "pm_card_visa",
  //     return_url: "https://google.com",
  //   },
  //   {
  //     stripeAccount: req.body.stripeId,
  //   },
  //   (err, charge) => {
  //     if (err) {
  //       res.json(false);
  //     } else {
  //       res.json(true);
  //     }
  //   }
  // );
});
