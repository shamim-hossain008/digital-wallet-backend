import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
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
  })
);

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
  })
);

// 6️⃣ Debug logger
app.use((req, res, next) => {
  console.log("Incoming:", req.method, req.path);
  next();
});

// 7️⃣ Routes
app.use("/api/v1", router);

// 8️⃣ Root route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Digital Wallet API server!",
  });
});

export default app;
