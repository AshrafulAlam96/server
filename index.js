const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./config/db");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure DB connection
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("ScholarStream API is running...");
});

app.use("/users", require("./routes/users.routes"));
app.use("/scholarships", require("./routes/scholarships.routes"));
app.use("/reviews", require("./routes/reviews.routes"));
app.use("/applications", require("./routes/applications.routes"));
app.use("/payments", require("./routes/payments.routes"));
app.use("/bookmarks", require("./routes/bookmarks.routes"));

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
