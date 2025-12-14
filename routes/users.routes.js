const express = require("express");
const router = express.Router();
const { getCollections } = require("../config/db");
const { ObjectId } = require("mongodb");

router.get("/role/:email", async (req, res) => {
  const { usersCollection } = await getCollections();
  const user = await usersCollection.findOne({ email: req.params.email });
  res.send({ role: user?.role || "student" });
});


/* GET all users */
router.get("/", async (req, res) => {
  const { usersCollection } = await getCollections();
  const users = await usersCollection.find().toArray();
  res.send(users);
});

/* GET single user */
router.get("/:id", async (req, res) => {
  const { usersCollection } = await getCollections();
  const user = await usersCollection.findOne({
    _id: new ObjectId(req.params.id),
  });
  res.send(user);
});

/* UPDATE role */
router.patch("/role/:id", async (req, res) => {
  const { role } = req.body;
  const { usersCollection } = await getCollections();

  const result = await usersCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { role } }
  );

  res.send(result);
});

/* DELETE user */
router.delete("/:id", async (req, res) => {
  const { usersCollection } = await getCollections();

  const result = await usersCollection.deleteOne({
    _id: new ObjectId(req.params.id),
  });

  res.send(result);
});

module.exports = router;
