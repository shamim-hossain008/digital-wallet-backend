"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const auth_interface_1 = require("../auth/auth.interface");
const admin_controller_1 = require("./admin.controller");
const router = (0, express_1.Router)();
router.get("/summary", (0, checkAuth_1.checkAuth)(auth_interface_1.Role.ADMIN), admin_controller_1.AdminController.getTransactionSummary);
router.get("/commission-payouts", (0, checkAuth_1.checkAuth)(auth_interface_1.Role.ADMIN), admin_controller_1.AdminController.getCommissionPayouts);
router.get("/commission-payouts/export", (0, checkAuth_1.checkAuth)(auth_interface_1.Role.ADMIN), admin_controller_1.AdminController.exportCommissionCSV);
exports.AdminRoutes = router;
//# sourceMappingURL=admin.route.js.map