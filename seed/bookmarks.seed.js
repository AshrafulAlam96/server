const { ObjectId } = require("mongodb");

module.exports = [
  {
    _id: new ObjectId(),
    scholarshipId: "SCHOLARSHIP_ID_1",
    email: "john@student.com",
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    scholarshipId: "SCHOLARSHIP_ID_3",
    email: "sarah@student.com",
    createdAt: new Date()
  }
];
