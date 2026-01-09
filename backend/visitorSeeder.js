// visitorSeeder.js
import Visitor from "./models/Visitor.js";

// Status values allowed by your schema
const statusOptions = ["waiting", "in-progress", "completed", "cancelled"];

const randomTime = (date, hour) => {
  const d = new Date(date);
  d.setHours(hour, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
  return d;
};

const generateVisitors = () => {
  const names = ["Ravi", "Pallavi", "Sanjay", "Amit", "Sneha"];
  let visitors = [];

  const today = new Date();

  for (let offset = 0; offset < 7; offset++) {
    let date = new Date(today);
    date.setDate(today.getDate() - offset);

    for (let i = 0; i < 5; i++) {
      const fullName = names[Math.floor(Math.random() * names.length)];

      visitors.push({
        fullName,
        mobile: "9" + Math.floor(100000000 + Math.random() * 900000000),

        idProofType: "aadhar",
        idProofNumber: "123456789123",

        purpose: "Office Visit",
        toMeet: "Admin",
        visitType: "walk-in",

        inTime: randomTime(date, 10 + i),
        status: statusOptions[Math.floor(Math.random() * statusOptions.length)],

        remarks: "Seeder sample visitor",
      });
    }
  }

  return visitors;
};

export const runVisitorSeeder = async () => {
  try {
    console.log("🚀 Visitor Seeder Started...");

    const sampleData = generateVisitors();
    await Visitor.insertMany(sampleData);

    console.log("✅ Visitors Inserted:", sampleData.length);
  } catch (err) {
    console.log("❌ Visitor seeding failed:", err.message);
  }
};
