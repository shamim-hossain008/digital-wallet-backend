import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import { router } from "./app/routes";

const app:Application = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

 app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Digital Wallet API server.....................! ",
  });
});

export default app;
