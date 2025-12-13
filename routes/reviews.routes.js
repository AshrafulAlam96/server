const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { connectDB } = require("../config/db");
const verifyJWT = require("../middleware/verifyJWT");
const { verifyAdmin, verifyModerator } = require("../middleware/verifyRole");

// ===============================
// GET approved reviews (PUBLIC)
// ===============================
router.get("/:scholarshipId", async (req, res) => {
  const db = await connectDB();
  const reviews = await db.collection("reviews").find({
    scholarshipId: req.params.scholarshipId,
    status: "approved"
  }).toArray();

  res.json(reviews);
});

// ===============================
// POST add review (STUDENT)
// ===============================
router.post("/", verifyJWT, async (req, res) => {
  const db = await connectDB();
  const review = {
    ...req.body,
    status: "pending",
    createdAt: new Date()
  };

  await db.collection("reviews").insertOne(review);
  res.json({ message: "Review submitted for moderation" });
});

// ===============================
// GET pending reviews (MODERATOR)
// ===============================
router.get("/moderation/pending", verifyJWT, verifyModerator, async (req, res) => {
  const db = await connectDB();
  const reviews = await db.collection("reviews").find({ status: "pending" }).toArray();
  res.json(reviews);
});

// ===============================
// PATCH approve / reject (MOD)
// ===============================
router.patch("/:id/status", verifyJWT, verifyModerator, async (req, res) => {
  const { status } = req.body;

  await (await connectDB()).collection("reviews").updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { status } }
  );

  res.json({ message: `Review ${status}` });
});

// ===============================
// DELETE review (ADMIN)
// ===============================
router.delete("/:id", verifyJWT, verifyAdmin, async (req, res) => {
  await (await connectDB()).collection("reviews").deleteOne({
    _id: new ObjectId(req.params.id)
  });

  res.json({ message: "Review deleted" });
});

module.exports = router;
