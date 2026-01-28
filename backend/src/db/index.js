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

    await mongoose.connect(mongoURI);

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // exit if DB connection fails
  }
};

export default connectDB;
