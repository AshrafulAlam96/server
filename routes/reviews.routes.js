const express = require("express");
const router = express.Router();
const client = require("../db/client");
const { ObjectId } = require("mongodb");

const verifyJWT = require("../middleware/verifyJWT");
const { verifyModerator, verifyAdmin } = require("../middleware/verifyRole");

const reviewsCollection = client.db("scholarstream").collection("reviews");

// =============================
// POST — Add or Update Review (Student)
// =============================
router.post("/", verifyJWT, async (req, res) => {
  const { scholarshipId, rating, comment } = req.body;
  const email = req.decoded.email;

  // Prevent multiple reviews for same scholarship
  const existing = await reviewsCollection.findOne({ scholarshipId, email });

  const reviewData = {
    scholarshipId,
    email,
    rating: Number(rating),
    comment,
    reviewedAt: new Date(),
  };

  if (existing) {
    // Update review
    const result = await reviewsCollection.updateOne(
      { _id: existing._id },
      { $set: reviewData }
    );

    return res.json({
      updated: true,
      message: "Review updated",
      result,
    });
  }

  // Insert new review
  const result = await reviewsCollection.insertOne(reviewData);

  res.json({
    inserted: true,
    message: "Review added",
    result,
  });
});

// =============================
// GET — Reviews for a scholarship
// =============================
router.get("/:scholarshipId", async (req, res) => {
  const scholarshipId = req.params.scholarshipId;

  const reviews = await reviewsCollection
    .find({ scholarshipId })
    .sort({ reviewedAt: -1 })
    .toArray();

  res.json(reviews);
});

// =============================
// DELETE — Student deletes own review
// =============================
router.delete("/:id", verifyJWT, async (req, res) => {
  const id = req.params.id;
  const email = req.decoded.email;

  const result = await reviewsCollection.deleteOne({
    _id: new ObjectId(id),
    email,
  });

  res.json({
    deleted: result.deletedCount > 0,
  });
});

// =============================
// DELETE — Moderator deletes any review
// =============================
router.delete("/mod/remove/:id", verifyJWT, verifyModerator, async (req, res) => {
  const id = req.params.id;

  const result = await reviewsCollection.deleteOne({
    _id: new ObjectId(id),
  });

  res.json({
    success: true,
    message: "Review removed by moderator",
    result,
  });
});

// =============================
// GET — Average rating for a scholarship
// =============================
router.get("/average/:scholarshipId", async (req, res) => {
  const scholarshipId = req.params.scholarshipId;

  const reviews = await reviewsCollection.find({ scholarshipId }).toArray();

  if (reviews.length === 0) {
    return res.json({ averageRating: 0 });
  }

  const avg =
    reviews.reduce((acc, cur) => acc + Number(cur.rating), 0) /
    reviews.length;

  res.json({ averageRating: avg.toFixed(1) });
});

module.exports = router;
