const { ObjectId } = require("mongodb");

module.exports = [
  {
    _id: new ObjectId(),
    name: "Global Excellence Scholarship",
    university: "University of Toronto",
    country: "Canada",
    degree: "Bachelor",
    fees: 50,
    stipend: 800,
    category: "Merit-Based",
    deadline: "2025-06-20",
    description: "Scholarship for outstanding international students.",
    image: "https://i.ibb.co/VTZcvbj/scholar1.jpg",
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: "DAAD Research Grant",
    university: "University of Bonn",
    country: "Germany",
    degree: "Masters",
    fees: 0,
    stipend: 1000,
    category: "Research",
    deadline: "2025-05-14",
    description: "Fund-funded research program.",
    image: "https://i.ibb.co/Pwz2km7/scholar2.jpg",
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: "Chevening Scholarship",
    university: "London School of Economics",
    country: "UK",
    degree: "Masters",
    fees: 100,
    stipend: 1200,
    category: "Government",
    deadline: "2025-07-10",
    description: "UK government global scholarship.",
    image: "https://i.ibb.co/310Tqtw/scholar3.jpg",
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: "Fulbright Scholarship",
    university: "Harvard University",
    country: "USA",
    degree: "PhD",
    fees: 200,
    stipend: 1500,
    category: "Fully-Funded",
    deadline: "2025-08-15",
    description: "Fully funded US education program.",
    image: "https://i.ibb.co/bNH05Z2/scholar4.jpg",
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: "Australian Awards Scholarship",
    university: "University of Sydney",
    country: "Australia",
    degree: "Masters",
    fees: 0,
    stipend: 900,
    category: "Government",
    deadline: "2025-06-01",
    description: "Scholarship for developing nations.",
    image: "https://i.ibb.co/CHY25vb/scholar5.jpg",
    createdAt: new Date()
  }
];
