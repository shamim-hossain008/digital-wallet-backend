import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import expressSession from "express-session";
import passport from "passport";

import { envVars } from "./app/config/env";
import "./app/config/passport";
import { router } from "./app/routes";

const app: Application = express();

// 2️⃣ Express session
app.use(
  expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);

// Disable ETag so Express won't return 304 based on ETag
app.set("etag", false);

// 3️⃣ Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

// 4️⃣ Body parsers
app.use(express.json());
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: envVars.FRONTEND_URL,
    credentials: true,
  }),
);

// Add a small middleware to prevent caching for API routes
app.use((req, res, next) => {
  // Only apply to API routes (adjust prefix if needed)
  if (req.originalUrl.startsWith("/api/")) {
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
  }
  next();
});

//  Debug logger
app.use((req, res, next) => {
  console.log("Incoming:", req.method, req.path);
  next();
});

//  Routes
app.use("/api/v1", router);

//  Root route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Digital Wallet API server!",
  });
});

// after all routes, error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";
  console.error("Global error:", message);
  res.status(status).json({ success: false, message });
});

export default app;
