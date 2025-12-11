const express = require("express");
const router = express.Router();
const client = require("../db/client");
const { verifyAdmin } = require("../middleware/verifyRole");
const verifyJWT = require("../middleware/verifyJWT");

// Collections
const users = client.db("scholarstream").collection("users");
const scholarships = client.db("scholarstream").collection("scholarships");
const applications = client.db("scholarstream").collection("applications");
const payments = client.db("scholarstream").collection("payments");

// ---- ADMIN STATS ----
router.get("/", verifyJWT, verifyAdmin, async (req, res) => {
  try {

    const totalUsers = await users.countDocuments();
    const totalScholarships = await scholarships.countDocuments();
    const totalApplications = await applications.countDocuments();

    const pendingApps = await applications.countDocuments({ status: "pending" });
    const approvedApps = await applications.countDocuments({ status: "approved" });
    const rejectedApps = await applications.countDocuments({ status: "rejected" });

    // Revenue (only succeeded payments)
    const revenueAgg = await payments.aggregate([
      { $match: { status: "succeeded" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]).toArray();

    const totalRevenue = revenueAgg[0]?.total || 0;

    // Monthly revenue trend (last 12 months)
    const monthlyRevenue = await payments.aggregate([
      { $match: { status: "succeeded" } },
      {
        $group: {
          _id: {
            year: { $year: "$succeededAt" },
            month: { $month: "$succeededAt" }
          },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]).toArray();

    // Monthly application trend
    const monthlyApplications = await applications.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$appliedAt" },
            month: { $month: "$appliedAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]).toArray();

    // Top 5 scholarships with most applications
    const topScholarships = await applications.aggregate([
      {
        $group: {
          _id: "$scholarshipId",
          total: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]).toArray();

    res.json({
      totalUsers,
      totalScholarships,
      totalApplications,
      pendingApps,
      approvedApps,
      rejectedApps,
      totalRevenue,
      monthlyRevenue,
      monthlyApplications,
      topScholarships
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
