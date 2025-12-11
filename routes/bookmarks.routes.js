const express = require("express");
const router = express.Router();
const client = require("../db/client");
const { ObjectId } = require("mongodb");

const verifyJWT = require("../middleware/verifyJWT");

const bookmarksCollection = client.db("scholarstream").collection("bookmarks");

// Add bookmark (student)
router.post("/", verifyJWT, async (req, res) => {
  try {
    const { scholarshipId } = req.body;
    const email = req.decoded.email;

    const existing = await bookmarksCollection.findOne({ scholarshipId, email });
    if (existing) return res.json({ added: false, message: "Already bookmarked" });

    const doc = { scholarshipId, email, createdAt: new Date() };
    const result = await bookmarksCollection.insertOne(doc);
    res.json({ added: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove bookmark
router.delete("/:scholarshipId", verifyJWT, async (req, res) => {
  try {
    const scholarshipId = req.params.scholarshipId;
    const email = req.decoded.email;

    const result = await bookmarksCollection.deleteOne({ scholarshipId, email });
    res.json({ removed: result.deletedCount > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List my bookmarks
router.get("/my", verifyJWT, async (req, res) => {
  try {
    const email = req.decoded.email;
    const items = await bookmarksCollection.find({ email }).toArray();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
