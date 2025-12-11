const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { getCollections } = require("../config/db");
const verifyJWT = require("../middleware/verifyJWT");
const { verifyAdmin, verifyModerator } = require("../middleware/verifyRole");

// All scholarships
router.get("/", async (req, res) => {
  const { scholarshipsCollection } = await getCollections();
  res.json(await scholarshipsCollection.find().toArray());
});

// Get details
router.get("/:id", async (req, res) => {
  const { scholarshipsCollection } = await getCollections();
  res.json(
    await scholarshipsCollection.findOne({ _id: new ObjectId(req.params.id) })
  );
});

// Add scholarship (Admin)
router.post("/", verifyJWT, verifyAdmin, async (req, res) => {
  const { scholarshipsCollection } = await getCollections();
  res.json(await scholarshipsCollection.insertOne(req.body));
});

// Update scholarship
router.patch("/:id", verifyJWT, verifyAdmin, async (req, res) => {
  const { scholarshipsCollection } = await getCollections();
  res.json(
    await scholarshipsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    )
  );
});

// Delete scholarship
router.delete("/:id", verifyJWT, verifyAdmin, async (req, res) => {
  const { scholarshipsCollection } = await getCollections();
  res.json(
    await scholarshipsCollection.deleteOne({ _id: new ObjectId(req.params.id) })
  );
});

module.exports = router;
