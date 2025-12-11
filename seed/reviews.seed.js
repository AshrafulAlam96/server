const { ObjectId } = require("mongodb");

module.exports = [
  {
    _id: new ObjectId(),
    scholarshipId: "SCHOLARSHIP_ID_1",
    email: "john@student.com",
    rating: 5,
    comment: "Excellent opportunity!",
    reviewedAt: new Date()
  },
  {
    _id: new ObjectId(),
    scholarshipId: "SCHOLARSHIP_ID_1",
    email: "sarah@student.com",
    rating: 4,
    comment: "Very helpful program.",
    reviewedAt: new Date()
  }
];
