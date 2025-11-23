import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import { envVars } from "./app/config/env";
import { router } from "./app/routes";

dotenv.config();

const app: Application = express();

/**
 * 1️⃣ Body parsers
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * 2️⃣ Cookies parser
 */
app.use(cookieParser());

/**
 * 3️⃣ CORS CONFIG (Express 4 Friendly)
 */
const corsOptions = {
  origin: envVars.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

/**
 * 4️⃣ Apply CORS
 */
app.use(cors(corsOptions));

/**
 * 5️⃣ Handle Preflight Requests Explicitly
 */
app.options("*", cors(corsOptions));

/**
 * 6️⃣ Debug logs
 */
app.use((req, res, next) => {
  console.log("Incoming:", req.method, req.path);
  next();
});

/**
 * 7️⃣ Routes
 */
app.use("/api/v1", router);

/**
 * 8️⃣ Root route
 */
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Digital Wallet API server!",
  });
});

export default app;
