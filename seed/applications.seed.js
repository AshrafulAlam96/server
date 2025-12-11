const { ObjectId } = require("mongodb");

module.exports = [
  {
    _id: new ObjectId(),
    scholarshipId: "SCHOLARSHIP_ID_1",
    email: "john@student.com",
    status: "pending",
    appliedAt: new Date()
  },
  {
    _id: new ObjectId(),
    scholarshipId: "SCHOLARSHIP_ID_2",
    email: "sarah@student.com",
    status: "approved",
    appliedAt: new Date()
  }
];
