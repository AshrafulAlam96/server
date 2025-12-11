const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { getCollections } = require("../config/db");
const verifyJWT = require("../middleware/verifyJWT");
const { verifyAdmin, verifyModerator } = require("../middleware/verifyRole");
const { ObjectId } = require("mongodb");

// Create JWT
router.post("/jwt", async (req, res) => {
  const token = jwt.sign(req.body, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.json({ token });
});

// Save user
router.post("/", async (req, res) => {
  const { usersCollection } = await getCollections();

  const user = req.body;
  const exists = await usersCollection.findOne({ email: user.email });

  if (exists) return res.json({ inserted: false, message: "User exists" });

  const result = await usersCollection.insertOne(user);
  res.json({ inserted: true, result });
});

// Get all users
router.get("/", verifyJWT, verifyAdmin, async (req, res) => {
  const { usersCollection } = await getCollections();
  res.json(await usersCollection.find().toArray());
});

// Get user role
router.get("/role/:email", async (req, res) => {
  const { usersCollection } = await getCollections();
  const user = await usersCollection.findOne({ email: req.params.email });
  res.json({ role: user?.role || "student" });
});

// Make admin
router.patch("/admin/:id", verifyJWT, verifyAdmin, async (req, res) => {
  const { usersCollection } = await getCollections();
  const result = await usersCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { role: "admin" } }
  );
  res.json(result);
});

// Make moderator
router.patch("/moderator/:id", verifyJWT, verifyAdmin, async (req, res) => {
  const { usersCollection } = await getCollections();
  const result = await usersCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { role: "moderator" } }
  );
  res.json(result);
});

module.exports = router;
