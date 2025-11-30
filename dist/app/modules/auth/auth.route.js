"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const env_1 = require("../../config/env");
const checkAuth_1 = require("../../middlewares/checkAuth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const user_validation_1 = require("../user/user.validation");
const auth_controller_1 = require("./auth.controller");
const auth_interface_1 = require("./auth.interface");
const router = (0, express_1.Router)();
// router.post("/logout", AuthController.logout);
// Minimal logout route
router.post("/logout", (req, res) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    });
    console.log("Logout route executed");
    res.status(200).json({
        success: true,
        message: "User Logged Out Successfully",
        data: null,
    });
});
router.post("/login", auth_controller_1.AuthController.credentialsLogin);
// router.post("/credentials-login", AuthController.credentialsLogin),
router.post("/refresh-token", auth_controller_1.AuthController.getNewAccessToken);
router.post("/register", (0, validateRequest_1.validateRequest)(user_validation_1.registerUserZodSchema), auth_controller_1.AuthController.register);
router.patch("/approve/:id", (0, checkAuth_1.checkAuth)(auth_interface_1.Role.ADMIN), auth_controller_1.AuthController.approveAgent);
router.patch("/suspend/:id", (0, checkAuth_1.checkAuth)(auth_interface_1.Role.ADMIN), auth_controller_1.AuthController.suspendAgent);
// /api/v1/auth/google
router.get("/google", async (req, res, next) => {
    const redirect = req.query.redirect || "/";
    passport_1.default.authenticate("google", {
        scope: ["profile", "email"],
        state: redirect,
    })(req, res, next);
});
//api/v1/auth/google/callback?state
router.get("/google/callback", passport_1.default.authenticate("google", {
    failureRedirect: `${env_1.envVars.FRONTEND_URL}/login?error=There is some issues with your account. Please contact with out support team!`,
}), auth_controller_1.AuthController.googleCallbackController);
exports.AuthRoutes = router;
//# sourceMappingURL=auth.route.js.map