const express = require("express");
const router = express.Router();
const client = require("../db/client");
const { ObjectId } = require("mongodb");

const verifyJWT = require("../middleware/verifyJWT");
const { verifyModerator, verifyAdmin } = require("../middleware/verifyRole");

const applicationsCollection = client
  .db("scholarstream")
  .collection("applications");

// =============================
// POST — Apply for a scholarship (Student)
// =============================
router.post("/", verifyJWT, async (req, res) => {
  try {
    const { scholarshipId } = req.body;
    const email = req.decoded.email;

    // Prevent double application
    const existing = await applicationsCollection.findOne({
      scholarshipId,
      email,
    });

    if (existing) {
      return res.json({
        applied: false,
        message: "Already applied to this scholarship",
      });
    }

    const application = {
      scholarshipId,
      email,
      status: "pending",
      appliedAt: new Date(),
    };

    const result = await applicationsCollection.insertOne(application);

    res.json({
      applied: true,
      result,
      message: "Application submitted",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================
// GET — Student's applied scholarships
// =============================
router.get("/my-applications", verifyJWT, async (req, res) => {
  const email = req.decoded.email;

  const applications = await applicationsCollection
    .find({ email })
    .toArray();

  res.json(applications);
});

// =============================
// DELETE — Cancel Application (Student)
// =============================
router.delete("/:id", verifyJWT, async (req, res) => {
  const id = req.params.id;
  const email = req.decoded.email;

  const result = await applicationsCollection.deleteOne({
    _id: new ObjectId(id),
    email, // only allow user to delete own application
  });

  res.json({ cancelled: result.deletedCount > 0 });
});

// =============================
// GET — All applications (Admin/Moderator)
// =============================
router.get("/", verifyJWT, verifyAdmin, async (req, res) => {
  const all = await applicationsCollection.find().toArray();
  res.json(all);
});

// =============================
// GET — Applications of a single scholarship
// =============================
router.get("/scholarship/:id", verifyJWT, verifyAdmin, async (req, res) => {
  const id = req.params.id;

  const list = await applicationsCollection
    .find({ scholarshipId: id })
    .toArray();

  res.json(list);
});

module.exports = router;
