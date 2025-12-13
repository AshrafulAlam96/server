const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { connectDB } = require("../config/db");
const verifyJWT = require("../middleware/verifyJWT");

// ===============================
// GET my bookmarks (STUDENT)
// ===============================
router.get("/my", verifyJWT, async (req, res) => {
  const db = await connectDB();

  const bookmarks = await db.collection("bookmarks").aggregate([
    { $match: { userId: req.user.uid } },
    {
      $lookup: {
        from: "scholarships",
        localField: "scholarshipId",
        foreignField: "_id",
        as: "scholarship"
      }
    },
    { $unwind: "$scholarship" }
  ]).toArray();

  res.json(bookmarks);
});

// ===============================
// POST bookmark (ADD)
// ===============================
router.post("/", verifyJWT, async (req, res) => {
  const db = await connectDB();
  const { scholarshipId } = req.body;

  const exists = await db.collection("bookmarks").findOne({
    userId: req.user.uid,
    scholarshipId: new ObjectId(scholarshipId)
  });

  if (exists) {
    return res.json({ added: false, message: "Already bookmarked" });
  }

  await db.collection("bookmarks").insertOne({
    userId: req.user.uid,
    scholarshipId: new ObjectId(scholarshipId),
    createdAt: new Date()
  });

  res.json({ added: true });
});

// ===============================
// DELETE bookmark (REMOVE)
// ===============================
router.delete("/:scholarshipId", verifyJWT, async (req, res) => {
  const db = await connectDB();

  await db.collection("bookmarks").deleteOne({
    userId: req.user.uid,
    scholarshipId: new ObjectId(req.params.scholarshipId)
  });

  res.json({ removed: true });
});

module.exports = router;
