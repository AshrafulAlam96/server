// server/routes/reviews.routes.js
const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { getCollections } = require("../config/db");
const verifyJWT = require("../middleware/verifyJWT");
const { verifyModerator } = require("../middleware/verifyRole");

/**
 * GET /reviews/:scholarshipId
 * List reviews for a scholarship (public)
 */
router.get("/:scholarshipId", async (req, res) => {
  try {
    const { reviewsCollection } = await getCollections();
    const scholarshipId = req.params.scholarshipId;
    const data = await reviewsCollection
      .find({ scholarshipId })
      .sort({ reviewedAt: -1 })
      .toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /reviews
 * Add or update a review (student)
 * Body: { scholarshipId, rating, comment }
 * If user already reviewed -> update, otherwise insert
 */
router.post("/", verifyJWT, async (req, res) => {
  try {
    const { reviewsCollection } = await getCollections();
    const { scholarshipId, rating, comment } = req.body;
    const email = req.decoded.email;

    const existing = await reviewsCollection.findOne({ scholarshipId, email });
    const doc = {
      scholarshipId,
      email,
      rating: Number(rating),
      comment,
      reviewedAt: new Date(),
    };

    if (existing) {
      const result = await reviewsCollection.updateOne(
        { _id: existing._id },
        { $set: doc }
      );
      return res.json({ updated: true, result });
    }

    const result = await reviewsCollection.insertOne(doc);
    res.json({ inserted: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /reviews/:id
 * Delete own review
 */
router.delete("/:id", verifyJWT, async (req, res) => {
  try {
    const { reviewsCollection } = await getCollections();
    const id = req.params.id;
    const email = req.decoded.email;

    const result = await reviewsCollection.deleteOne({
      _id: new ObjectId(id),
      email,
    });

    res.json({ deleted: result.deletedCount > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /reviews/mod/remove/:id
 * Moderator deletes any review
 */
router.delete(
  "/mod/remove/:id",
  verifyJWT,
  verifyModerator,
  async (req, res) => {
    try {
      const { reviewsCollection } = await getCollections();
      const id = req.params.id;
      const result = await reviewsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.json({ success: result.deletedCount > 0, result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * GET /reviews/avg/:scholarshipId
 * Average rating for a scholarship
 */
router.get("/avg/:scholarshipId", async (req, res) => {
  try {
    const { reviewsCollection } = await getCollections();
    const scholarshipId = req.params.scholarshipId;
    const cursor = reviewsCollection.find({ scholarshipId });
    const arr = await cursor.toArray();
    if (!arr.length) return res.json({ avg: 0, count: 0 });
    const avg =
      arr.reduce((s, r) => s + Number(r.rating || 0), 0) / arr.length;
    res.json({ avg: Number(avg.toFixed(1)), count: arr.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
