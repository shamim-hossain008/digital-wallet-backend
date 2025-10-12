"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const auth_interface_1 = require("../auth/auth.interface");
const transaction_controller_1 = require("./transaction.controller");
const transaction_validation_1 = require("./transaction.validation");
const router = (0, express_1.Router)();
router.post("/deposit", (0, checkAuth_1.checkAuth)(auth_interface_1.Role.USER), (0, validateRequest_1.validateRequest)(transaction_validation_1.depositSchema), transaction_controller_1.TransactionController.deposit);
router.post("/withdraw", (0, checkAuth_1.checkAuth)(auth_interface_1.Role.USER), (0, validateRequest_1.validateRequest)(transaction_validation_1.withdrawSchema), transaction_controller_1.TransactionController.withdraw);
router.post("/transfer", (0, checkAuth_1.checkAuth)(auth_interface_1.Role.USER), (0, validateRequest_1.validateRequest)(transaction_validation_1.transferSchema), transaction_controller_1.TransactionController.transfer);
router.get("/me", (0, checkAuth_1.checkAuth)(auth_interface_1.Role.USER, auth_interface_1.Role.AGENT), transaction_controller_1.TransactionController.getMyTransactions);
router.get('/all', (0, checkAuth_1.checkAuth)(auth_interface_1.Role.ADMIN), transaction_controller_1.TransactionController.getAllTransactions);
router.post("/cash-in", (0, checkAuth_1.checkAuth)(auth_interface_1.Role.AGENT), transaction_controller_1.TransactionController.cashIn);
router.post("/cash-out", (0, checkAuth_1.checkAuth)(auth_interface_1.Role.AGENT), transaction_controller_1.TransactionController.cashOut);
exports.TransactionRoutes = router;
//# sourceMappingURL=transaction.route.js.map