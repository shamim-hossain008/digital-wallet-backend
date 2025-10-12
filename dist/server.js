"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./app/config/env");
const app_1 = __importDefault(require("./app"));
let server;
const startServer = async () => {
    try {
        await mongoose_1.default.connect(env_1.envVars.DB_URL);
        console.log("✅ Connected to mongoose successfully");
        server = app_1.default.listen(env_1.envVars.PORT, () => {
            console.log(`Server is listening to port: ${env_1.envVars.PORT}`);
        });
    }
    catch (err) {
        console.error("Failed to connect BD", err);
        process.exit(1);
    }
};
(async () => {
    await startServer();
})();
//# sourceMappingURL=server.js.map