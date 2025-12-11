const { ObjectId } = require("mongodb");

module.exports = [
  {
    _id: new ObjectId(),
    name: "John Doe",
    email: "john@student.com",
    role: "student",
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: "Sarah Lee",
    email: "sarah@student.com",
    role: "student",
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: "Michael Smith",
    email: "michael@student.com",
    role: "student",
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: "Alice Johnson",
    email: "alice@student.com",
    role: "student",
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: "David Kim",
    email: "david@student.com",
    role: "student",
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: "Moderator Mike",
    email: "mod@example.com",
    role: "moderator",
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: "Admin One",
    email: "admin1@example.com",
    role: "admin",
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: "Admin Two",
    email: "admin2@example.com",
    role: "admin",
    createdAt: new Date()
  }
];
