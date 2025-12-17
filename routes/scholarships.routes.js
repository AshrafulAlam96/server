const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { getCollections } = require("../config/db");
const verifyJWT = require("../middleware/verifyJWT");
const { verifyAdmin, verifyModerator } = require("../middleware/verifyRole");

/* =======================
   GET ALL SCHOLARSHIPS
======================= */
router.get("/", async (req, res) => {
  const { scholarshipsCollection } = await getCollections();
  const data = await scholarshipsCollection.find().toArray();
  res.send(data);
});

/* =======================
   GET SINGLE SCHOLARSHIP
======================= */
router.get("/:id", async (req, res) => {
  const { scholarshipsCollection } = await getCollections();
  const scholarship = await scholarshipsCollection.findOne({
    _id: new ObjectId(req.params.id),
  });

  if (!scholarship) {
    return res.status(404).send({ message: "Scholarship not found" });
  }

  res.send(scholarship);
});

/* =======================
   ADD SCHOLARSHIP (ADMIN)
======================= */
router.post("/", verifyJWT, verifyAdmin, async (req, res) => {
  const { scholarshipsCollection } = await getCollections();

  const result = await scholarshipsCollection.insertOne({
    ...req.body,
    createdAt: new Date(),
  });

  res.send({
    success: true,
    insertedId: result.insertedId,
  });
});

/* =======================
   UPDATE SCHOLARSHIP (ADMIN)
======================= */
router.put("/:id", verifyJWT, verifyAdmin, async (req, res) => {
  const { scholarshipsCollection } = await getCollections();

  const result = await scholarshipsCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: req.body }
  );

  if (result.modifiedCount === 0) {
    return res.status(404).send({ message: "No changes made" });
  }

  res.send({
    success: true,
    modifiedCount: result.modifiedCount,
  });
});

/* =======================
   DELETE SCHOLARSHIP (ADMIN)
======================= */
router.delete("/:id", verifyJWT, verifyAdmin, async (req, res) => {
  try {
    const { scholarshipsCollection } = await getCollections();

    const result = await scholarshipsCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "Scholarship not found" });
    }

    res.send({
      success: true,
      message: "Scholarship deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// GET pending scholarships (Moderator)
router.get("/pending/mod", verifyJWT, verifyModerator, async (req, res) => {
  const { scholarshipsCollection } = await getCollections();
  const result = await scholarshipsCollection
    .find({ status: "pending" })
    .toArray();
  res.send(result);
});

// Approve / Reject scholarship
router.patch("/status/:id", verifyJWT, verifyModerator, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const { scholarshipsCollection } = await getCollections();

  const result = await scholarshipsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status } }
  );

  res.send(result);
});


module.exports = router;
