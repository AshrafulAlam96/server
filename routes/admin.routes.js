const express = require("express");
const router = express.Router();
const client = require("../db/client");
const { verifyAdmin } = require("../middleware/verifyRole");
const verifyJWT = require("../middleware/verifyJWT");

const users = client.db("scholarstream").collection("users");
const scholarships = client.db("scholarstream").collection("scholarships");
const applications = client.db("scholarstream").collection("applications");
const reviews = client.db("scholarstream").collection("reviews");

// =============================
// GET — Admin Dashboard Statistics
// =============================
router.get("/stats", verifyJWT, verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await users.countDocuments();
    const totalScholarships = await scholarships.countDocuments();
    const totalApplications = await applications.countDocuments();
    const totalReviews = await reviews.countDocuments();

    // Role counts
    const roleCounts = {
      admin: await users.countDocuments({ role: "admin" }),
      moderator: await users.countDocuments({ role: "moderator" }),
      student: await users.countDocuments({ role: "student" }),
    };

    // Applications status
    const applicationStatus = {
      pending: await applications.countDocuments({ status: "pending" }),
      approved: await applications.countDocuments({ status: "approved" }),
      rejected: await applications.countDocuments({ status: "rejected" }),
    };

    // Category stats
    const categories = await scholarships
      .aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ])
      .toArray();

    // Country stats (optional)
    const countries = await scholarships
      .aggregate([
        { $group: { _id: "$country", count: { $sum: 1 } } },
      ])
      .toArray();

    res.json({
      totalUsers,
      totalScholarships,
      totalApplications,
      totalReviews,
      roleCounts,
      applicationStatus,
      categories,
      countries,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
