// server/routes/applications.routes.js
const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { getCollections } = require("../config/db");
const verifyJWT = require("../middleware/verifyJWT");
const { verifyModerator, verifyAdmin } = require("../middleware/verifyRole");

/**
 * POST /applications
 * Student applies for a scholarship (or paid flow creates application later)
 * Body: { scholarshipId }
 */
router.post("/", verifyJWT, async (req, res) => {
  try {
    const { applicationsCollection } = await getCollections();
    const { scholarshipId } = req.body;
    const email = req.decoded.email;

    // prevent duplicate
    const exists = await applicationsCollection.findOne({
      scholarshipId,
      email,
    });
    if (exists) {
      return res.json({ applied: false, message: "Already applied" });
    }

    const doc = {
      scholarshipId,
      email,
      status: "pending",
      appliedAt: new Date(),
      paid: req.body.paid === true,
      paymentIntentId: req.body.paymentIntentId || null,
    };

    const result = await applicationsCollection.insertOne(doc);
    res.json({ applied: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /applications/my-applications
 * Get logged-in student's applications
 */
router.get("/my-applications", verifyJWT, async (req, res) => {
  try {
    const { applicationsCollection } = await getCollections();
    const email = req.decoded.email;
    const data = await applicationsCollection.find({ email }).toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /applications/:id
 * Student cancels own application
 */
router.delete("/:id", verifyJWT, async (req, res) => {
  try {
    const { applicationsCollection } = await getCollections();
    const id = req.params.id;
    const email = req.decoded.email;

    const result = await applicationsCollection.deleteOne({
      _id: new ObjectId(id),
      email,
    });

    res.json({ cancelled: result.deletedCount > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /applications
 * Admin: get all applications
 */
router.get("/", verifyJWT, verifyAdmin, async (req, res) => {
  try {
    const { applicationsCollection } = await getCollections();
    const data = await applicationsCollection.find().toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /applications/scholarship/:id
 * Admin: get applications for a scholarship
 */
router.get(
  "/scholarship/:id",
  verifyJWT,
  verifyAdmin,
  async (req, res) => {
    try {
      const { applicationsCollection } = await getCollections();
      const scholarshipId = req.params.id;
      const data = await applicationsCollection
        .find({ scholarshipId })
        .toArray();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * GET /applications/pending
 * Moderator: get pending applications
 */
router.get("/pending", verifyJWT, verifyModerator, async (req, res) => {
  try {
    const { applicationsCollection } = await getCollections();
    const data = await applicationsCollection
      .find({ status: "pending" })
      .toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /applications/approve/:id
 * Moderator approves application
 */
router.patch(
  "/approve/:id",
  verifyJWT,
  verifyModerator,
  async (req, res) => {
    try {
      const { applicationsCollection } = await getCollections();
      const id = req.params.id;
      const result = await applicationsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "approved", reviewedAt: new Date() } }
      );
      res.json({ success: result.modifiedCount > 0, result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * PATCH /applications/reject/:id
 * Moderator rejects application
 */
router.patch("/reject/:id", verifyJWT, verifyModerator, async (req, res) => {
  try {
    const { applicationsCollection } = await getCollections();
    const id = req.params.id;
    const result = await applicationsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "rejected", reviewedAt: new Date() } }
    );
    res.json({ success: result.modifiedCount > 0, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
