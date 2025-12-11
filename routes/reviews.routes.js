const express = require("express");
const router = express.Router();
const client = require("../db/client");
const { ObjectId } = require("mongodb");

const verifyJWT = require("../middleware/verifyJWT");
const { verifyModerator } = require("../middleware/verifyRole");

const reviews = client.db("scholarstream").collection("reviews");

// -------------------------------------------
// GET reviews for a scholarship
// -------------------------------------------
router.get("/:scholarshipId", async (req, res) => {
  const scholarshipId = req.params.scholarshipId;
  const data = await reviews
    .find({ scholarshipId })
    .sort({ reviewedAt: -1 })
    .toArray();
  res.json(data);
});

// -------------------------------------------
// POST Add or Update Review
// -------------------------------------------
router.post("/", verifyJWT, async (req, res) => {
  const { scholarshipId, rating, comment } = req.body;
  const email = req.decoded.email;

  const existing = await reviews.findOne({ scholarshipId, email });

  const reviewData = {
    scholarshipId,
    email,
    rating: Number(rating),
    comment,
    reviewedAt: new Date(),
  };

  if (existing) {
    const result = await reviews.updateOne(
      { _id: existing._id },
      { $set: reviewData }
    );
    return res.json({ updated: true, result });
  }

  const result = await reviews.insertOne(reviewData);
  res.json({ inserted: true, result });
});

// -------------------------------------------
// DELETE Student's own review
// -------------------------------------------
router.delete("/:id", verifyJWT, async (req, res) => {
  const id = req.params.id;
  const email = req.decoded.email;

  const result = await reviews.deleteOne({
    _id: new ObjectId(id),
    email,
  });

  res.json({ deleted: result.deletedCount > 0 });
});

// -------------------------------------------
// DELETE Moderator Review (for moderation)
// -------------------------------------------
router.delete("/mod/remove/:id", verifyJWT, verifyModerator, async (req, res) => {
  const id = req.params.id;

  const result = await reviews.deleteOne({ _id: new ObjectId(id) });

  res.json({ success: true, result });
});

// -------------------------------------------
// GET Average Rating
// -------------------------------------------
router.get("/avg/:scholarshipId", async (req, res) => {
  const scholarshipId = req.params.scholarshipId;

  const all = await reviews.find({ scholarshipId }).toArray();
  if (!all.length) return res.json({ avg: 0 });

  const avg =
    all.reduce((sum, r) => sum + Number(r.rating), 0) / all.length;

  res.json({ avg: Number(avg.toFixed(1)) });
});

module.exports = router;
