const express = require("express");
const router = express.Router();
const client = require("../db/client");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Database collection
const usersCollection = client.db("scholarstream").collection("users");

// ========================
// POST /jwt — issue token
// ========================
router.post("/jwt", async (req, res) => {
  const user = req.body; // { email }
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.json({ token });
});

// ========================
// POST /users — Save user
// ========================
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

// ========================
// GET /users — list all users (admin later)
// ========================
router.get("/", async (req, res) => {
  const result = await usersCollection.find().toArray();
  res.json(result);
});

module.exports = router;
