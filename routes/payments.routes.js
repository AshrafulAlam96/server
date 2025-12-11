// server/routes/payments.routes.js
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "");
const { getCollections } = require("../config/db");
const verifyJWT = require("../middleware/verifyJWT");
const { ObjectId } = require("mongodb");

/**
 * POST /payments/create-payment-intent
 * Body: { amount, currency = 'usd', scholarshipId }
 */
router.post("/create-payment-intent", verifyJWT, async (req, res) => {
  try {
    const { paymentsCollection } = await getCollections();
    const { amount, currency = "usd", scholarshipId } = req.body;
    const email = req.decoded.email;

    if (!stripe) return res.status(500).json({ error: "Stripe not configured" });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency,
      metadata: { scholarshipId, email },
    });

    // store pending payment
    await paymentsCollection.insertOne({
      scholarshipId,
      email,
      amount: Number(amount),
      currency,
      status: "pending",
      paymentIntentId: paymentIntent.id,
      createdAt: new Date(),
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /payments/confirm
 * Called by frontend after confirm (optional if webhook used)
 * Body: { paymentIntentId, scholarshipId }
 */
router.post("/confirm", verifyJWT, async (req, res) => {
  try {
    const { paymentsCollection, applicationsCollection } = await getCollections();
    const { paymentIntentId, scholarshipId } = req.body;
    const email = req.decoded.email;

    // mark payment succeeded
    await paymentsCollection.updateOne(
      { paymentIntentId },
      { $set: { status: "succeeded", succeededAt: new Date() } }
    );

    // create application record (paid)
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

/**
 * POST /payments/webhook
 * Use raw body parser in index.js or configure route to use bodyParser.raw
 * Optional: recommended for production to rely on webhook events.
 */
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(400).send("Webhook secret not configured");
    }
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    // handle payment succeeded
    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object;
      const paymentIntentId = intent.id;
      const { paymentsCollection, applicationsCollection } = await getCollections();

      await paymentsCollection.updateOne(
        { paymentIntentId },
        { $set: { status: "succeeded", succeededAt: new Date() } }
      );

      // optionally create application if not exists
      const meta = intent.metadata || {};
      if (meta.scholarshipId && meta.email) {
        const exists = await applicationsCollection.findOne({
          paymentIntentId,
        });
        if (!exists) {
          await applicationsCollection.insertOne({
            scholarshipId: meta.scholarshipId,
            email: meta.email,
            status: "pending",
            appliedAt: new Date(),
            paid: true,
            paymentIntentId,
          });
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

module.exports = router;
