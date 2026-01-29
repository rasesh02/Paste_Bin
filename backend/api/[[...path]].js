import serverless from "serverless-http";
import connectDB from "../src/db/index.js";
import { app } from "../src/app.js";

let isConnected = false;
async function ensureDb() {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
}

const handler = serverless(app);

export default async function vercelHandler(req, res) {
  await ensureDb();
  return handler(req, res);
}
