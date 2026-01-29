// src/middlewares/connectDB.middleware.js
import connectDB from "../db/index.js";

let isConnected = false;
let connectionError = null;

async function ensureDb() {
  if (connectionError) throw connectionError;
  if (!isConnected) {
    console.log("Attempting MongoDB connection...");
    await connectDB();
    isConnected = true;
    console.log("✓ MongoDB connected");
  }
}

export default async function connectDBMiddleware(req, res, next) {
  try {
    await ensureDb();
    next();
  } catch (err) {
    next(err);
  }
}
