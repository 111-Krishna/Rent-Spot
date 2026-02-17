import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Property from "../models/Property.js";
import bcrypt from "bcryptjs";

const seed = async () => {
  try {
    await connectDB();
    // clear
    await User.deleteMany({});
    await Property.deleteMany({});

    const pass = await bcrypt.hash("password", 10);
    const host = await User.create({
      name: "Demo Host",
      email: "host@example.com",
      password: pass,
      role: "admin",
    });
    const user = await User.create({
      name: "Demo User",
      email: "user@example.com",
      password: pass,
      role: "user",
    });

    const uploads = [
      "uploads/1757607868849-tokyo.jpg",
      "uploads/1757607868852-maldives.jpg",
      "uploads/1757607868852-ny.jpg",
      "uploads/1757608188388-paris.jpg",
      "uploads/1757608188388-tokyo.jpg",
      "uploads/1757608188532-maldives.jpg",
      "uploads/1757608213932-tokyo.jpg",
      "uploads/1757608213933-paris.jpg",
      "uploads/1757608213984-maldives.jpg",
    ];

    await Property.insertMany([
      {
        title: "3BHK Villa in Jhansi",
        description: "Spacious villa with modern amenities.",
        location: "Jhansi",
        price: 40000,
        images: [uploads[0], uploads[1], uploads[2]],
        createdBy: host._id,
      },
      {
        title: "1BHK Farmhouse in Lucknow",
        description: "Peaceful farmhouse with scenic views.",
        location: "Lucknow",
        price: 60000,
        images: [uploads[3], uploads[4], uploads[5]],
        createdBy: host._id,
      },
      {
        title: "1BHK flat in Manali",
        description: "Cozy flat near mountains.",
        location: "Manali",
        price: 60000,
        images: [uploads[6], uploads[7], uploads[8]],
        createdBy: host._id,
      },
      {
        title: "1BHK Modern Flat in Kanpur",
        description: "Modern flat in city center.",
        location: "Kanpur",
        price: 30000,
        images: [uploads[0], uploads[1], uploads[2]],
        createdBy: host._id,
      },
      {
        title: "2BHK Modern Villa in Jhansi",
        description: "Luxury villa with garden.",
        location: "Jhansi",
        price: 50000,
        images: [uploads[3], uploads[4], uploads[5]],
        createdBy: host._id,
      },
      {
        title: "1BHK house in Manali",
        description: "Mountain view property.",
        location: "Manali",
        price: 50000,
        images: [uploads[6], uploads[7], uploads[8]],
        createdBy: host._id,
      },
      {
        title: "1BHK Hut house in Kasol",
        description: "Rustic hut experience.",
        location: "Kasol",
        price: 70000,
        images: [uploads[0], uploads[1], uploads[2]],
        createdBy: host._id,
      },
      {
        title: "2BHK house in Jhansi",
        description: "Family-friendly home.",
        location: "Jhansi",
        price: 30000,
        images: [uploads[3], uploads[4], uploads[5]],
        createdBy: host._id,
      },
      {
        title: "1BHK flat in Jhansi",
        description: "Compact and comfortable.",
        location: "Jhansi",
        price: 20000,
        images: [uploads[6], uploads[7], uploads[8]],
        createdBy: host._id,
      },
      {
        title: "1BHK house in Manali",
        description: "Snow view accommodation.",
        location: "Manali",
        price: 40000,
        images: [uploads[0], uploads[1], uploads[2]],
        createdBy: host._id,
      },
      {
        title: "1BHK 2nd floor in Jhansi",
        description: "Upper floor apartment.",
        location: "Jhansi",
        price: 20000,
        images: [uploads[3], uploads[4], uploads[5]],
        createdBy: host._id,
      },
      {
        title: "1BHK house in Goa",
        description: "Beach-side property.",
        location: "Goa",
        price: 60000,
        images: [uploads[6], uploads[7], uploads[8]],
        createdBy: host._id,
      },
    ]);

    console.log(
      "Seed completed. Emails: host@example.com / user@example.com  (password: password)",
    );
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
