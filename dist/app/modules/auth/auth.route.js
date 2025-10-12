"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const user_validation_1 = require("../user/user.validation");
const auth_controller_1 = require("./auth.controller");
const auth_interface_1 = require("./auth.interface");
const router = (0, express_1.Router)();
router.post("/register", (0, validateRequest_1.validateRequest)(user_validation_1.registerUserZodSchema), auth_controller_1.AuthController.register);
router.post("/login", auth_controller_1.AuthController.login);
router.patch("/approve/:id", (0, checkAuth_1.checkAuth)(auth_interface_1.Role.ADMIN), auth_controller_1.AuthController.approveAgent);
router.patch("/suspend/:id", (0, checkAuth_1.checkAuth)(auth_interface_1.Role.ADMIN), auth_controller_1.AuthController.suspendAgent);
exports.AuthRoutes = router;
//# sourceMappingURL=auth.route.js.map