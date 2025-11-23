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
      console.log(`Server is listening to port: ${envVars.PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect BD", err);
    process.exit(1);
  }
};

(async () => {
  await startServer();
})();
