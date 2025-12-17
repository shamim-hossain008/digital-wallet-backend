import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log("✅ Connected to mongoose successfully");

    server = app.listen(envVars.PORT, () => {
      console.log(`🚀 Server listening on port ${envVars.PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server", err);
    process.exit(1);
  }
};

const shutdown = async () => {
  console.log("🛑 Shutting down server...");

  if (server) {
    server.close(() => {
      console.log("🧹 HTTP server closed");
    });
  }

  await mongoose.disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown); // Ctrl+C

startServer();
