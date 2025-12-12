const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const verifyJWT = require("../middleware/verifyJWT");
const { getCollections } = require("../config/db");

router.post("/create-payment-intent", verifyJWT, async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is missing");
    }

    const { amount, scholarshipId, email } = req.body;

    const intent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "usd",
      metadata: { scholarshipId, email },
    });

    res.json({ clientSecret: intent.client_secret });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
