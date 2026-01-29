import connectDB from "./db/index.js";
import {app} from "./app.js"
import dotenv from "dotenv"

dotenv.config({path:'./.env'})

if (process.env.VERCEL !== "1") {
  await connectDB().then(() => {
    app.listen(process.env.PORT || 6000, () => {
      console.log("Local server running");
    });
  });
}

