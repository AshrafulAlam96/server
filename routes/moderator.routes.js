// server/routes/moderator.routes.js

const express = require("express");
const router = express.Router();
const { getCollections } = require("../config/db");
const verifyJWT = require("../middleware/verifyJWT");
const { verifyModerator } = require("../middleware/verifyRole");

router.get("/stats", async (req, res) => {
  const {
    scholarshipsCollection,
    applicationsCollection,
    reviewsCollection,
  } = await getCollections();

  const stats = {
    pendingScholarships: await scholarshipsCollection.countDocuments({ status: "pending" }),
    pendingApplications: await applicationsCollection.countDocuments({ status: "pending" }),
    pendingReviews: await reviewsCollection.countDocuments({ status: "pending" }),
  };

  res.send(stats);
});

module.exports = router;
