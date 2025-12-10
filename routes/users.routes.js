const express = require("express");
const router = express.Router();
const client = require("../db/client");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");  // FIXED

const verifyJWT = require("../middleware/verifyJWT");
const { verifyAdmin, verifyModerator } = require("../middleware/verifyRole");

require("dotenv").config();

const usersCollection = client.db("scholarstream").collection("users");

// JWT issue
router.post("/jwt", async (req, res) => {
  const user = req.body; 
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

// Save user
router.post("/", async (req, res) => {
  try {
    const user = req.body;

    const existing = await usersCollection.findOne({ email: user.email });
    if (existing) {
      return res.json({ message: "User already exists", inserted: false });
    }

    const result = await usersCollection.insertOne(user);
    res.json({ inserted: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get("/", async (req, res) => {
  const result = await usersCollection.find().toArray();
  res.json(result);
});

// Get role by email
router.get("/role/:email", async (req, res) => {
  const email = req.params.email;
  const user = await usersCollection.findOne({ email });
  res.json({ role: user?.role || "student" });
});

// Make Admin
router.patch("/admin/:id", verifyJWT, verifyAdmin, async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };

  const result = await usersCollection.updateOne(filter, { $set: { role: "admin" } });
  res.json(result);
});

// Make Moderator
router.patch("/moderator/:id", verifyJWT, verifyAdmin, async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };

  const result = await usersCollection.updateOne(filter, { $set: { role: "moderator" } });
  res.json(result);
});

module.exports = router;
