const express = require("express");
const router = express.Router();
const { getCollections } = require("../config/db");

/* ============================
   CREATE / SYNC USER
============================ */
router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!email) return res.status(400).send({ message: "Email required" });

    const { usersCollection } = await getCollections();

    // check existing user
    const existing = await usersCollection.findOne({ email });
    if (existing) {
      return res.send(existing);
    }

    const user = {
      name: name || "Anonymous",
      email,
      role: "student",
      createdAt: new Date()
    };

    const result = await usersCollection.insertOne(user);
    res.send({ ...user, _id: result.insertedId });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

/* ============================
   GET USER ROLE
============================ */
router.get("/role/:email", async (req, res) => {
  const { usersCollection } = await getCollections();
  const user = await usersCollection.findOne({ email: req.params.email });
  res.send({ role: user?.role || "student" });
});

module.exports = router;
