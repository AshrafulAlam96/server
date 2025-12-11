const { MongoClient } = require("mongodb");
require("dotenv").config();

// import seed data
const users = require("./users.seed");
const scholarships = require("./scholarships.seed");
const applications = require("./applications.seed");
const reviews = require("./reviews.seed");
const payments = require("./payments.seed");
const bookmarks = require("./bookmarks.seed");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

async function seed() {
  try {
    await client.connect();
    const db = client.db("scholarstream");

    console.log("🔥 Clearing old data...");
    await db.collection("users").deleteMany({});
    await db.collection("scholarships").deleteMany({});
    await db.collection("applications").deleteMany({});
    await db.collection("reviews").deleteMany({});
    await db.collection("payments").deleteMany({});
    await db.collection("bookmarks").deleteMany({});

    console.log("🌱 Seeding new data...");
    await db.collection("users").insertMany(users);
    await db.collection("scholarships").insertMany(scholarships);
    await db.collection("applications").insertMany(applications);
    await db.collection("reviews").insertMany(reviews);
    await db.collection("payments").insertMany(payments);
    await db.collection("bookmarks").insertMany(bookmarks);

    console.log("✅ Database seed completed!");
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

seed();
