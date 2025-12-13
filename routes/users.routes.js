const express = require("express");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { getCollections } = require("../config/db");

const router = express.Router();

// ========================
// POST /users/jwt
// ========================
router.post("/jwt", async (req, res) => {
  const { email } = req.body;

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token });
});

// ========================
// POST /users (register sync)
// ========================
router.post("/", async (req, res) => {
  const { name, email } = req.body;
  const { usersCollection } = await getCollections();

  const existing = await usersCollection.findOne({ email });
  if (existing) {
    return res.json({ inserted: false });
  }

  const user = {
    name,
    email,
    role: "student",
    createdAt: new Date(),
  };

  const result = await usersCollection.insertOne(user);
  res.json({ inserted: true, result });
});

// ========================
// GET role by email
// ========================
router.get("/role/:email", async (req, res) => {
  const { email } = req.params;
  const { usersCollection } = await getCollections();

  const user = await usersCollection.findOne({ email });
  res.json({ role: user?.role || "student" });
});

module.exports = router;
