import serverless from "serverless-http";
import connectDB from "../src/db/index.js";
import { app } from "../src/app.js";

let isConnected = false;

async function ensureDb() {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
      console.log("✓ MongoDB connected in serverless function");
    } catch (error) {
      console.error("✗ MongoDB connection failed:", error.message);
      throw error;
    }
  }
}

const handler = serverless(app);

export default async function vercelHandler(req, res) {
  try {
    await ensureDb();
    return handler(req, res);
  } catch (error) {
    console.error("Function handler error:", error);
    return res.status(500).json({ 
      error: "internal_server_error",
      message: error.message 
    });
  }
}
