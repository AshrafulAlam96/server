// server/routes/admin.routes.js
const express = require("express");
const router = express.Router();
const { getCollections } = require("../config/db");
const verifyJWT = require("../middleware/verifyJWT");
const { verifyAdmin } = require("../middleware/verifyRole");
const { ObjectId } = require("mongodb");

/**
 * Admin Dashboard Stats
 */
router.get("/stats", verifyJWT, verifyAdmin, async (req, res) => {
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

    const roleCounts = {
      admins: await usersCollection.countDocuments({ role: "admin" }),
      moderators: await usersCollection.countDocuments({ role: "moderator" }),
      students: await usersCollection.countDocuments({ role: "student" }),
    };

    const applicationStatus = {
      pending: await applicationsCollection.countDocuments({ status: "pending" }),
      approved: await applicationsCollection.countDocuments({ status: "approved" }),
      rejected: await applicationsCollection.countDocuments({ status: "rejected" }),
    };

    const payments = await paymentsCollection.aggregate([
      { $match: { status: "succeeded" } },
      { $group: { _id: null, revenue: { $sum: "$amount" } } },
    ]).toArray();

    const totalRevenue = payments[0]?.revenue || 0;

    res.json({
      totalUsers,
      totalScholarships,
      totalApplications,
      totalReviews,
      roleCounts,
      applicationStatus,
      totalRevenue,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Admin — Delete Any User
 */
router.delete("/user/:id", verifyJWT, verifyAdmin, async (req, res) => {
  try {
    const { usersCollection } = await getCollections();
    const result = await usersCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });
    res.json({ success: result.deletedCount > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Admin — Delete Any Scholarship
 */
router.delete("/scholarship/:id", verifyJWT, verifyAdmin, async (req, res) => {
  try {
    const { scholarshipsCollection } = await getCollections();
    const result = await scholarshipsCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });
    res.json({ success: result.deletedCount > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
