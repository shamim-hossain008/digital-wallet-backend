import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../auth/auth.interface";
import { WalletController } from "./wallet.controller";

const router = Router();

router.get(
  "/me",
  checkAuth(Role.USER, Role.AGENT),
  WalletController.getMyWallet
);
router.patch(
  "/block/:userId",
  checkAuth(Role.ADMIN),
  WalletController.blockWallet
);
router.patch(
  "/unblock/:userId",
  checkAuth(Role.ADMIN),
  WalletController.unblockWallet
);

export const WalletRoutes = router;
