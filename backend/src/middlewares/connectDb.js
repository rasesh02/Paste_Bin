import connectDB from "../db/index.js";

export default async function connectDBMiddleware(req, res, next) {
  try {
    await connectDB(); // uses cached connection
    next();
  } catch (err) {
    next(err);
  }
}
