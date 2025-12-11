const express = require("express");
const router = express.Router();
const client = require("../db/client");
const { ObjectId } = require("mongodb");

const verifyJWT = require("../middleware/verifyJWT");
const { verifyAdmin } = require("../middleware/verifyRole");

// Database collection
const scholarshipsCollection = client
  .db("scholarstream")
  .collection("scholarships");

// ========================
// POST — ADD NEW SCHOLARSHIP (ADMIN ONLY)
// ========================
router.post("/", verifyJWT, verifyAdmin, async (req, res) => {
  try {
    const scholarship = req.body;
    scholarship.createdAt = new Date();

    const result = await scholarshipsCollection.insertOne(scholarship);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================
// GET — ALL SCHOLARSHIPS
// ========================
router.get("/", async (req, res) => {
  const scholarships = await scholarshipsCollection.find().toArray();
  res.json(scholarships);
});

// ========================
// GET — SINGLE SCHOLARSHIP BY ID
// ========================
router.get("/:id", async (req, res) => {
  const id = req.params.id;

  const scholarship = await scholarshipsCollection.findOne({
    _id: new ObjectId(id),
  });

  res.json(scholarship);
});

// ========================
// PATCH — UPDATE SCHOLARSHIP (ADMIN ONLY)
// ========================
router.patch("/:id", verifyJWT, verifyAdmin, async (req, res) => {
  const id = req.params.id;
  const body = req.body;

  const filter = { _id: new ObjectId(id) };

  const update = {
    $set: body,
  };

  const result = await scholarshipsCollection.updateOne(filter, update);

  res.json(result);
});

// ========================
// DELETE — REMOVE SCHOLARSHIP (ADMIN ONLY)
// ========================
router.delete("/:id", verifyJWT, verifyAdmin, async (req, res) => {
  const id = req.params.id;

  const result = await scholarshipsCollection.deleteOne({
    _id: new ObjectId(id),
  });

  res.json(result);
});

// ========================
// GET — FILTERED SCHOLARSHIPS
// ========================
router.get("/", async (req, res) => {
  const {
    search,
    category,
    degree,
    country,
    sort,
    page = 1,
    limit = 10,
  } = req.query;

  const query = {};

  // Text search
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { university: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by degree
  if (degree) {
    query.degree = degree;
  }

  // Filter by country
  if (country) {
    query.country = country;
  }

  // Sorting logic
  let sortQuery = {};

  if (sort === "deadline") {
    sortQuery = { deadline: 1 }; // soonest first
  } else if (sort === "newest") {
    sortQuery = { createdAt: -1 }; // newest first
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const cursor = scholarshipsCollection
    .find(query)
    .sort(sortQuery)
    .skip(skip)
    .limit(parseInt(limit));

  const results = await cursor.toArray();

  // For pagination count
  const totalCount = await scholarshipsCollection.countDocuments(query);

  res.json({
    page: parseInt(page),
    limit: parseInt(limit),
    total: totalCount,
    totalPages: Math.ceil(totalCount / limit),
    data: results,
  });
});


module.exports = router;
