const client = require("../db/client");

const usersCollection = client.db("scholarstream").collection("users");

// ADMIN middleware
const verifyAdmin = async (req, res, next) => {
  const email = req.decoded?.email;

  const user = await usersCollection.findOne({ email });

  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin only" });
  }

  next();
};

// MODERATOR middleware
const verifyModerator = async (req, res, next) => {
  const email = req.decoded?.email;

  const user = await usersCollection.findOne({ email });

  if (!user || user.role !== "moderator") {
    return res.status(403).json({ message: "Forbidden - Moderator only" });
  }

  next();
};

module.exports = { verifyAdmin, verifyModerator };
