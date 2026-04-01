import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import {app, server} from "./lib/socket.js";


dotenv.config();


const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();
const frontendDistPath = path.join(__dirname, "../frontend/dist");
const isProduction = process.env.NODE_ENV === "production";

app.use(express.json());
app.use(cookieParser());

if (!isProduction) {
   app.use(cors({
      origin: "http://localhost:5173",
      credentials: true,
   }));
}

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (isProduction) {
   app.use(express.static(frontendDistPath));

   // Express 5 requires named wildcards for SPA catch-all routes.
   app.get("/{*splat}", (req, res) => {
      res.sendFile(path.join(frontendDistPath, "index.html"));
   });
}


server.listen(PORT, () => {
   console.log("Server is Running on PORT:" + PORT);
   connectDB();
});
