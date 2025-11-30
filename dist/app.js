"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const env_1 = require("./app/config/env");
require("./app/config/passport");
const routes_1 = require("./app/routes");
const app = (0, express_1.default)();
// 2️⃣ Express session
app.use((0, express_session_1.default)({
    secret: env_1.envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
// 3️⃣ Initialize Passport
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use((0, cookie_parser_1.default)());
// 4️⃣ Body parsers
app.use(express_1.default.json());
app.set("trust proxy", 1);
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: env_1.envVars.FRONTEND_URL,
    credentials: true,
}));
// 6️⃣ Debug logger
app.use((req, res, next) => {
    console.log("Incoming:", req.method, req.path);
    next();
});
// 7️⃣ Routes
app.use("/api/v1", routes_1.router);
// 8️⃣ Root route
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to Digital Wallet API server!",
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map