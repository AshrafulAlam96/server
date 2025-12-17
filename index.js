// MUST be first
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");

const app = express();
const port = process.env.PORT || 5000;

// ======================================================
// 1) Stripe Webhook MUST be BEFORE express.json()
//    AND ONLY on the webhook route
// ======================================================
app.use(
  "/webhook/stripe",
  express.raw({ type: "application/json" })
);

// ======================================================
// 2) Everything else uses express.json()
// ======================================================
app.use(express.json());
app.use(cors());

// Connect DB
connectDB();

// ======================================================
// 3) Register API Routes (ORDER DOES MATTER)
// ======================================================
app.use("/users", require("./routes/users.routes"));
app.use("/scholarships", require("./routes/scholarships.routes"));
app.use("/applications", require("./routes/applications.routes"));
app.use("/bookmarks", require("./routes/bookmarks.routes"));
app.use("/payments", require("./routes/payments.routes"));

app.use("/admin", require("./routes/admin.routes"));
app.use("/reviews", require("./routes/reviews.routes"));     // ← FIXED

app.use("/moderator", require("./routes/moderator.routes"));


// Webhook route (AFTER raw middleware)
app.use("/webhook", require("./routes/webhook.routes"));

// Home
app.get("/", (req, res) => {
  res.send("API running...");
});

// Start server
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
