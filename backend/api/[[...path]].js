import serverless from "serverless-http";
import connectDB from "../src/db/index.js";
import { app } from "../src/app.js";

let isConnected = false;
let connectionError = null;

async function ensureDb() {
  if (connectionError) {
    throw connectionError;
  }
  
  if (!isConnected) {
    try {
      console.log("Attempting MongoDB connection...");
      const startTime = Date.now();
      await connectDB();
      const elapsed = Date.now() - startTime;
      isConnected = true;
      console.log(`✓ MongoDB connected in ${elapsed}ms`);
    } catch (error) {
      console.error("✗ MongoDB connection failed:", error.message);
      connectionError = error;
      throw error;
    }
  }
}

const handler = serverless(app);

export default async function vercelHandler(req, res) {
  try {
    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("DB connection timeout (8s)")), 8000);
    });
    
    await Promise.race([ensureDb(), timeoutPromise]);
    return handler(req, res);
  } catch (error) {
    console.error("Function handler error:", error);
    return res.status(500).json({ 
      error: "internal_server_error",
      message: error.message,
      env_check: {
        has_mongodb_url: !!process.env.MONGODB_URL,
        mongodb_url_length: process.env.MONGODB_URL?.length || 0
      }
    });
  }
}
