const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const { getCollections } = require("../config/db");

// ===============================
// POST /users  (Sync Firebase user)
// ===============================
router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const { usersCollection } = await getCollections();

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.json(existingUser); // already synced
    }

    const newUser = {
      name: name || "Anonymous",
      email,
      role: "student", // ✅ default role
      createdAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ===============================
// POST /users/jwt  (Issue token)
// ===============================
router.post("/jwt", async (req, res) => {
  try {
    const user = req.body; // { email }

    if (!user?.email) {
      return res.status(400).json({ message: "Email required" });
    }

    const token = jwt.sign(
      user,
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ==================================
// GET /users/role/:email  (IMPORTANT)
// ==================================
router.get("/role/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const { usersCollection } = await getCollections();

    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({ role: "student" });
    }

    res.json({ role: user.role || "student" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ===============================
// GET /users  (Admin use later)
// ===============================
router.get("/", async (req, res) => {
  try {
    const { usersCollection } = await getCollections();
    const users = await usersCollection.find().toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ===============================
// PATCH /users/role/:id (Admin)
// ===============================
router.patch("/role/:id", async (req, res) => {
  try {
    const { role } = req.body;
    const id = req.params.id;

    const { usersCollection } = await getCollections();

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { role } }
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
