// /api/[[...path]].js
import serverless from "serverless-http";
import { app } from "../src/app.js";  // note relative path

export default serverless(app);
