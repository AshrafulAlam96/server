require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("../config/db");

const app = express();

// Stripe webhook must come first
app.use("/webhook/stripe", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(cors());

connectDB();

// Routes
app.use("/users", require("../routes/users.routes"));
app.use("/scholarships", require("../routes/scholarships.routes"));
app.use("/applications", require("../routes/applications.routes"));
app.use("/reviews", require("../routes/reviews.routes"));
app.use("/bookmarks", require("../routes/bookmarks.routes"));
app.use("/payments", require("../routes/payments.routes"));
app.use("/webhook", require("../routes/webhook.routes"));
app.use("/admin", require("../routes/admin.routes"));

app.get("/", (req, res) => {
  res.send("ScholarStream API Live 🚀");
});

module.exports = app;
