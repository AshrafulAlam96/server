// server/routes/bookmarks.routes.js
const express = require("express");
const router = express.Router();
const { getCollections } = require("../config/db");
const verifyJWT = require("../middleware/verifyJWT");

/**
 * POST /bookmarks
 * Body: { scholarshipId }
 */
router.post("/", verifyJWT, async (req, res) => {
  try {
    const { bookmarksCollection } = await getCollections();
    const { scholarshipId } = req.body;
    const email = req.decoded.email;

    const existing = await bookmarksCollection.findOne({ scholarshipId, email });
    if (existing) return res.json({ added: false, message: "Already bookmarked" });

    const result = await bookmarksCollection.insertOne({
      scholarshipId,
      email,
      createdAt: new Date(),
    });

    res.json({ added: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /bookmarks/:scholarshipId
 */
router.delete("/:scholarshipId", verifyJWT, async (req, res) => {
  try {
    const { bookmarksCollection } = await getCollections();
    const scholarshipId = req.params.scholarshipId;
    const email = req.decoded.email;

    const result = await bookmarksCollection.deleteOne({ scholarshipId, email });
    res.json({ removed: result.deletedCount > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /bookmarks/my
 */
router.get("/my", verifyJWT, async (req, res) => {
  try {
    const { bookmarksCollection } = await getCollections();
    const email = req.decoded.email;
    const data = await bookmarksCollection.find({ email }).toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
