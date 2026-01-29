import serverless from "serverless-http";
import connectDB from "../src/db/index.js";
import { app } from "../src/app.js";

let isConnected = false;
let connectionError = null;

async function ensureDb() {
  if (connectionError) throw connectionError;

  if (!isConnected) {
    try {
      console.log("Attempting MongoDB connection...");
      await connectDB();
      isConnected = true;
      console.log("✓ MongoDB connected");
    } catch (err) {
      connectionError = err;
      throw err;
    }
  }
}

// DB middleware
app.use(async (req, res, next) => {
  try {
    await ensureDb();
    next();
  } catch (err) {
    next(err);
  }
});

const handler = serverless(app, {
  callbackWaitsForEmptyEventLoop: false,
});

export default function vercelHandler(req, res) {
  return handler(req, res);
}
