"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const auth_interface_1 = require("../auth/auth.interface");
const wallet_controller_1 = require("./wallet.controller");
const router = (0, express_1.Router)();
router.get("/me", (0, checkAuth_1.checkAuth)(auth_interface_1.Role.USER, auth_interface_1.Role.AGENT), wallet_controller_1.WalletController.getMyWallet);
router.get("/all", (0, checkAuth_1.checkAuth)(auth_interface_1.Role.ADMIN), wallet_controller_1.WalletController.getAllWallets);
router.patch("/block/:userId", (0, checkAuth_1.checkAuth)(auth_interface_1.Role.ADMIN), wallet_controller_1.WalletController.blockWallet);
router.patch("/unblock/:userId", (0, checkAuth_1.checkAuth)(auth_interface_1.Role.ADMIN), wallet_controller_1.WalletController.unblockWallet);
exports.WalletRoutes = router;
//# sourceMappingURL=wallet.route.js.map