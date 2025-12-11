const { ObjectId } = require("mongodb");

module.exports = [
  {
    _id: new ObjectId(),
    scholarshipId: "SCHOLARSHIP_ID_1",
    email: "john@student.com",
    amount: 50,
    currency: "usd",
    status: "succeeded",
    paymentIntentId: "pi_12345",
    createdAt: new Date(),
    succeededAt: new Date()
  },
  {
    _id: new ObjectId(),
    scholarshipId: "SCHOLARSHIP_ID_3",
    email: "alice@student.com",
    amount: 100,
    currency: "usd",
    status: "succeeded",
    paymentIntentId: "pi_98765",
    createdAt: new Date(),
    succeededAt: new Date()
  }
];
