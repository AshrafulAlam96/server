// server/routes/adminStats.routes.js
const express = require("express");
const router = express.Router();
const { getCollections } = require("../config/db");
const verifyJWT = require("../middleware/verifyJWT");
const { verifyAdmin } = require("../middleware/verifyRole");

/**
 * GET /admin/stats
 * Admin-only analytics
 */
router.get("/", verifyJWT, verifyAdmin, async (req, res) => {
  try {
    const {
      usersCollection,
      scholarshipsCollection,
      applicationsCollection,
      reviewsCollection,
      paymentsCollection,
    } = await getCollections();

    const totalUsers = await usersCollection.countDocuments();
    const totalScholarships = await scholarshipsCollection.countDocuments();
    const totalApplications = await applicationsCollection.countDocuments();
    const totalReviews = await reviewsCollection.countDocuments();

    // roles
    const roleCounts = {
      admin: await usersCollection.countDocuments({ role: "admin" }),
      moderator: await usersCollection.countDocuments({ role: "moderator" }),
      student: await usersCollection.countDocuments({ role: "student" }),
    };

    // application statuses
    const applicationStatus = {
      pending: await applicationsCollection.countDocuments({ status: "pending" }),
      approved: await applicationsCollection.countDocuments({ status: "approved" }),
      rejected: await applicationsCollection.countDocuments({ status: "rejected" }),
    };

    // categories
    const categories = await scholarshipsCollection.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]).toArray();

    // revenue
    const revenueAgg = await paymentsCollection.aggregate([
      { $match: { status: "succeeded" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]).toArray();
    const totalRevenue = revenueAgg[0]?.total || 0;

    res.json({
      totalUsers,
      totalScholarships,
      totalApplications,
      totalReviews,
      roleCounts,
      applicationStatus,
      categories,
      totalRevenue,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
