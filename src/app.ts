import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import { envVars } from "./app/config/env";
import { rateLimiter } from "./app/middlewares/rateLimiter";
import { router } from "./app/routes";

const app: Application = express();

app.set("trust proxy", 1);

// Configure CORS
app.use(
  cors({
    origin: [
      envVars.FRONTEND_URL, // your local dev frontend
      // your deployed frontend
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Allow all OPTIONS preflights
app.options("*", cors());

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", router);
app.use(rateLimiter);


app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Digital Wallet API server.....................! ",
  });
});

export default app;
