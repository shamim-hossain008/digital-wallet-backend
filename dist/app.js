"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const env_1 = require("./app/config/env");
const routes_1 = require("./app/routes");
dotenv_1.default.config();
const app = (0, express_1.default)();
/**
 * 1️⃣ Body parsers
 */
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
/**
 * 2️⃣ Cookies parser
 */
app.use((0, cookie_parser_1.default)());
/**
 * 3️⃣ CORS CONFIG (Express 4 Friendly)
 */
const corsOptions = {
    origin: env_1.envVars.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};
/**
 * 4️⃣ Apply CORS
 */
app.use((0, cors_1.default)(corsOptions));
/**
 * 5️⃣ Handle Preflight Requests Explicitly
 */
app.options("*", (0, cors_1.default)(corsOptions));
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
app.use("/api/v1", routes_1.router);
/**
 * 8️⃣ Root route
 */
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to Digital Wallet API server!",
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map