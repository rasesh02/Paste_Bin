import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import connectDBMiddleware from "./middlewares/connectDb.js";


//await connectDB();

const app=express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
// app.use(cors({
//     origin: "http://localhost:5173",  // IMPORTANT
//     credentials: true
// }));

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser())

app.use(connectDBMiddleware);

import allRoutesRouter from "./routes/allRoutes.routes.js"
//apis
app.use('/api',allRoutesRouter);

export {app}
