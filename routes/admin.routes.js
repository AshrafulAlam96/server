const express = require("express");
const router = express.Router();
const { getCollections } = require("../config/db");

// ==============================
// GET /admin/stats
// ==============================
router.get("/stats", async (req, res) => {
  try {
    const {
      usersCollection,
      scholarshipsCollection,
      applicationsCollection,
      reviewsCollection
    } = await getCollections();

    const totalUsers = await usersCollection.countDocuments();
    const totalScholarships = await scholarshipsCollection.countDocuments();
    const totalApplications = await applicationsCollection.countDocuments();
    const totalReviews = await reviewsCollection.countDocuments();

    // Role based count
    const adminCount = await usersCollection.countDocuments({ role: "admin" });
    const moderatorCount = await usersCollection.countDocuments({ role: "moderator" });
    const studentCount = await usersCollection.countDocuments({ role: "student" });

    res.json({
      totalUsers,
      totalScholarships,
      totalApplications,
      totalReviews,
      roles: {
        admin: adminCount,
        moderator: moderatorCount,
        student: studentCount
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
