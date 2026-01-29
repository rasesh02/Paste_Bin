
import mongoose from "mongoose";
// import dotenv from "dotenv";

// dotenv.config();
mongoose.set("bufferCommands", false);
mongoose.set("bufferTimeoutMS", 0); // 🔥 important

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  const mongoURI = process.env.MONGODB_URL;
  if (!mongoURI) {
    throw new Error("Missing MONGODB_URL environment variable");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 5,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;
