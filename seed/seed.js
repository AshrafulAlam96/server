// server/seed/seed.js
require("dotenv").config();   // ← MUST BE VERY FIRST LINE

const { MongoClient } = require("mongodb");

const users = require("./users.seed");
const scholarships = require("./scholarships.seed");
const applications = require("./applications.seed");
const reviews = require("./reviews.seed");
const payments = require("./payments.seed");
const bookmarks = require("./bookmarks.seed");

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "scholarStreamDB";

async function run() {
  if (!uri) {
    throw new Error("❌ MONGODB_URI is missing. Add it to server/.env");
  }

  console.log("🔗 Connecting to:", uri);

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db(dbName);
  console.log("🎉 Connected to DB:", dbName);

  // Clear collections
  await db.collection("users").deleteMany({});
  await db.collection("scholarships").deleteMany({});
  await db.collection("applications").deleteMany({});
  await db.collection("reviews").deleteMany({});
  await db.collection("payments").deleteMany({});
  await db.collection("bookmarks").deleteMany({});

  // Insert seed data
  await db.collection("users").insertMany(users);
  await db.collection("scholarships").insertMany(scholarships);
  await db.collection("applications").insertMany(applications);
  await db.collection("reviews").insertMany(reviews);
  await db.collection("payments").insertMany(payments);
  await db.collection("bookmarks").insertMany(bookmarks);

  console.log("✅ Seeding Complete!");
  await client.close();
}

run().catch(console.error);
