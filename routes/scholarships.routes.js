const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { getCollections } = require("../config/db");
const verifyJWT = require("../middleware/verifyJWT");
const { verifyAdmin } = require("../middleware/verifyRole");

// ===============================
// TOP SCHOLARSHIPS (HOME PAGE)
// ===============================
router.get("/top", async (req, res) => {
  try {
    const { scholarshipsCollection } = await getCollections();

    const scholarships = await scholarshipsCollection
      .find()
      .sort({ stipend: -1, createdAt: -1 })
      .limit(6)
      .toArray();

    res.json(scholarships);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ALL SCHOLARSHIPS
// ===============================
router.get("/", async (req, res) => {
  const { scholarshipsCollection } = await getCollections();
  res.json(await scholarshipsCollection.find().toArray());
});

// ===============================
// SINGLE SCHOLARSHIP (DETAILS)
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ SAFETY CHECK
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid scholarship ID" });
    }

    const { scholarshipsCollection } = await getCollections();
    const scholarship = await scholarshipsCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!scholarship) {
      return res.status(404).json({ error: "Scholarship not found" });
    }

    res.json(scholarship);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ADD (ADMIN)
// ===============================
router.post("/", verifyJWT, verifyAdmin, async (req, res) => {
  const { scholarshipsCollection } = await getCollections();
  const result = await scholarshipsCollection.insertOne({
    ...req.body,
    createdAt: new Date()
  });
  res.json(result);
});

// ===============================
// UPDATE (ADMIN)
// ===============================
router.put("/:id", verifyJWT, verifyAdmin, async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const { scholarshipsCollection } = await getCollections();
  const result = await scholarshipsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: req.body }
  );

  res.json(result);
});

// ===============================
// DELETE (ADMIN)
// ===============================
router.delete("/:id", verifyJWT, verifyAdmin, async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const { scholarshipsCollection } = await getCollections();
  await scholarshipsCollection.deleteOne({ _id: new ObjectId(id) });

  res.json({ success: true });
});

module.exports = router;
