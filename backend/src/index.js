import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import {app, server} from "./lib/socket.js";


dotenv.config();


const PORT = process.env.PORT || 5001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");
const hasFrontendBuild = fs.existsSync(frontendDistPath);
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

if (isProduction || hasFrontendBuild) {
   app.use(express.static(frontendDistPath));

   // Avoid wildcard route syntax differences in Express 5 and only
   // serve the SPA shell for browser navigations outside the API.
   app.use((req, res, next) => {
      if (
         req.method !== "GET" ||
         req.path.startsWith("/api") ||
         !req.accepts("html")
      ) {
         return next();
      }

      res.sendFile(path.join(frontendDistPath, "index.html"));
   });
}


server.listen(PORT, () => {
   console.log("Server is Running on PORT:" + PORT);
   connectDB();
});
