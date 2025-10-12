"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouts = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const auth_interface_1 = require("../auth/auth.interface");
const user_controller_1 = require("./user.controller");
const user_validation_1 = require("./user.validation");
const router = (0, express_1.Router)();
// all user route
router.get("/all-users", (0, checkAuth_1.checkAuth)(auth_interface_1.Role.ADMIN), user_controller_1.UserController.getAllUsers);
// user profile
router.get("/me", (0, checkAuth_1.checkAuth)(...Object.values(auth_interface_1.Role)), user_controller_1.UserController.getMe);
// single user route
router.get("/:id", (0, checkAuth_1.checkAuth)(...Object.values(auth_interface_1.Role)), user_controller_1.UserController.getSingleUser);
// update user
router.patch("/:id", (0, validateRequest_1.validateRequest)(user_validation_1.updatedUserZodSchema), (0, checkAuth_1.checkAuth)(...Object.values(auth_interface_1.Role)), user_controller_1.UserController.updatedUser);
// delete user
router.delete("/:id", (0, checkAuth_1.checkAuth)(auth_interface_1.Role.ADMIN), user_controller_1.UserController.deleteUser);
exports.UserRouts = router;
//# sourceMappingURL=user.route.js.map