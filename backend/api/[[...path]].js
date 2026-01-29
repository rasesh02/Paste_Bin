import connectDB from "../src/db/index.js";
import { app } from "../src/app.js";

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

app.use(async (req, res, next) => {
  try {
    await ensureDb();
    next();
  } catch (err) {
    next(err);
  }
});

export default app;
