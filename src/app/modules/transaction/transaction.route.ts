import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../auth/auth.interface";
import { TransactionController } from "./transaction.controller";
import { depositSchema, transferSchema, withdrawSchema } from "./transaction.validation";

const router = Router();

router.post("/deposit", checkAuth(Role.USER),validateRequest(depositSchema), TransactionController.deposit);
router.post("/withdraw", checkAuth(Role.USER),validateRequest(withdrawSchema), TransactionController.withdraw);
router.post("/transfer", checkAuth(Role.USER),validateRequest(transferSchema), TransactionController.transfer);
router.get(
  "/me",
  checkAuth(Role.USER, Role.AGENT),
  TransactionController.getMyTransactions
);
router.get('/all', checkAuth(Role.ADMIN), TransactionController.getAllTransactions)
router.post("/cash-in", checkAuth(Role.AGENT), TransactionController.cashIn);
router.post("/cash-out", checkAuth(Role.AGENT), TransactionController.cashOut);

export const TransactionRoutes = router;
