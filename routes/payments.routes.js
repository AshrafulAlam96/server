const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const verifyJWT = require("../middleware/verifyJWT");
const client = require("../db/client");
const { ObjectId } = require("mongodb");

const paymentsCollection = client.db("scholarstream").collection("payments");
const applicationsCollection = client.db("scholarstream").collection("applications");
const scholarshipsCollection = client.db("scholarstream").collection("scholarships");

// Create PaymentIntent
router.post("/create-payment-intent", verifyJWT, async (req, res) => {
  try {
    const { amount, currency = "usd", scholarshipId } = req.body;
    const email = req.decoded.email;

    // amount must be in cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: { scholarshipId, email },
    });

    // you may optionally store a pending payment record
    await paymentsCollection.insertOne({
      scholarshipId,
      email,
      amount,
      currency,
      status: "pending",
      paymentIntentId: paymentIntent.id,
      createdAt: new Date()
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Confirm endpoint (optional, you can rely on webhook)
// Called by client after successful confirmation to link application
router.post("/confirm", verifyJWT, async (req, res) => {
  try {
    const { paymentIntentId, scholarshipId } = req.body;
    const email = req.decoded.email;

    // update payment record
    await paymentsCollection.updateOne(
      { paymentIntentId },
      { $set: { status: "succeeded", succeededAt: new Date() } }
    );

    // create application as paid
    const application = {
      scholarshipId,
      email,
      status: "pending",
      appliedAt: new Date(),
      paid: true,
      paymentIntentId,
    };
    const result = await applicationsCollection.insertOne(application);

    res.json({ applied: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
