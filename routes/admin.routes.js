const express = require("express");
const router = express.Router();
const { connectDB } = require("../config/db");
const verifyJWT = require("../middleware/verifyJWT");
const { verifyAdmin } = require("../middleware/verifyRole");

router.get("/stats", verifyJWT, verifyAdmin, async (req, res) => {
  const db = await connectDB();

  const users = db.collection("users");
  const scholarships = db.collection("scholarships");
  const applications = db.collection("applications");
  const payments = db.collection("payments");

  const totalUsers = await users.countDocuments();
  const totalScholarships = await scholarships.countDocuments();
  const totalApplications = await applications.countDocuments();

  const pending = await applications.countDocuments({ status: "pending" });
  const approved = await applications.countDocuments({ status: "approved" });
  const rejected = await applications.countDocuments({ status: "rejected" });

  const revenueAgg = await payments.aggregate([
    { $match: { status: "succeeded" } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]).toArray();

  const totalRevenue = revenueAgg[0]?.total || 0;

  res.json({
    totalUsers,
    totalScholarships,
    totalApplications,
    applications: { pending, approved, rejected },
    totalRevenue
  });
});

module.exports = router;
