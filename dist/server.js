"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const env_1 = require("./app/config/env");
// ✅ Log loaded environment variables
console.log("✅ Loaded environment variables:");
console.log("PORT:", env_1.envVars.PORT);
console.log("FRONTEND_URL:", env_1.envVars.FRONTEND_URL);
console.log("DB_URL:", env_1.envVars.DB_URL);
console.log("NODE_ENV:", env_1.envVars.NODE_ENV);
console.log("JWT_ACCESS_SECRET:", env_1.envVars.JWT_ACCESS_SECRET);
console.log("JWT_REFRESH_SECRET:", env_1.envVars.JWT_REFRESH_SECRET);
console.log("BCRYPT_SALT_ROUND:", env_1.envVars.BCRYPT_SALT_ROUND);
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