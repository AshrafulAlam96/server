const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { getCollections } = require("../config/db");
const verifyJWT = require("../middleware/verifyJWT");
const { verifyAdmin } = require("../middleware/verifyRole");

/**
 * GET /admin/stats
 * Admin Analytics
 */
router.get("/stats", verifyJWT, verifyAdmin, async (req, res) => {
  const {
    usersCollection,
    scholarshipsCollection,
    applicationsCollection,
    reviewsCollection,
  } = await getCollections();

  const users = await usersCollection.countDocuments();
  const scholarships = await scholarshipsCollection.countDocuments();
  const applications = await applicationsCollection.countDocuments();
  const reviews = await reviewsCollection.countDocuments();

  res.json({ users, scholarships, applications, reviews });
});

/**
 * GET /admin/users
 */
router.get("/users", async (req, res) => {
  const { usersCollection } = await getCollections();
  const users = await usersCollection.find().toArray();
  res.json(users);
});

/**
 * PATCH /admin/users/admin/:id
 */
router.patch("/users/admin/:id", verifyJWT, verifyAdmin, async (req, res) => {
  const { usersCollection } = await getCollections();
  const result = await usersCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { role: "admin" } }
  );
  res.json(result);
});

/**
 * PATCH /admin/users/moderator/:id
 */
router.patch("/users/moderator/:id", verifyJWT, verifyAdmin, async (req, res) => {
  const { usersCollection } = await getCollections();
  const result = await usersCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { role: "moderator" } }
  );
  res.json(result);
});

module.exports = router;
