import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../auth/auth.interface";
import { TransactionController } from "./transaction.controller";

const router = Router();

router.post("/deposit", checkAuth(Role.USER), TransactionController.deposit);
router.post("/withdraw", checkAuth(Role.USER), TransactionController.withdraw);
router.post("/transfer", checkAuth(Role.USER), TransactionController.transfer);
router.get(
  "/me",
  checkAuth(Role.USER, Role.AGENT),
  TransactionController.getMyTransactions
);
router.get('/all', checkAuth(Role.ADMIN), TransactionController.getAllTransactions)
router.post("/cash-in", checkAuth(Role.AGENT), TransactionController.cashIn);
router.post("/cash-out", checkAuth(Role.AGENT), TransactionController.cashOut);

export const TransactionRoutes = router;
