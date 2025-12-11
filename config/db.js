// server/config/db.js
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

// If user forgets .env, fallback to working URI
const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://scholarStreamDB:Spro3DFfnu8Mf5tD@cluster0.0sd3ccw.mongodb.net/?appName=Cluster0";

const dbName = process.env.DB_NAME || "scholarStreamDB";

// Global variables (Vercel safe)
let client;
let db;

// All your project collections
let usersCollection;
let scholarshipsCollection;
let reviewsCollection;
let applicationsCollection;
let paymentsCollection;
let bookmarksCollection;

/**
 * 🔥 Connect to MongoDB (lazy connection)
 * Works perfectly on Vercel & Serverless environments.
 */
async function connectDB() {
  try {
    if (db) return db; // Already connected

    if (!client) {
      client = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
      });
    }

    await client.connect();
    db = client.db(dbName);

    // Bind collections
    usersCollection = db.collection("users");
    scholarshipsCollection = db.collection("scholarships");
    reviewsCollection = db.collection("reviews");
    applicationsCollection = db.collection("applications");
    paymentsCollection = db.collection("payments");
    bookmarksCollection = db.collection("bookmarks");

    console.log("✅ MongoDB Connected Successfully (Vercel Safe)");
    return db;
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    throw err;
  }
}

/**
 * Always ensure connection before returning collections
 */
async function getCollections() {
  if (!db) await connectDB();

  return {
    usersCollection,
    scholarshipsCollection,
    reviewsCollection,
    applicationsCollection,
    paymentsCollection,
    bookmarksCollection,
  };
}

module.exports = { connectDB, getCollections };
