// backend/src/db/index.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URL || "";

    if (!mongoURI) {
      throw new Error("Missing MONGODB_URL in environment variables");
    }

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Fail fast after 5s
      socketTimeoutMS: 45000,
    });

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // exit if DB connection fails
  }
};

export default connectDB;
