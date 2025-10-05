import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../auth/auth.interface";
import { AdminController } from "./admin.controller";

const router = Router();

router.get(
  "/summary",
  checkAuth(Role.ADMIN),
  AdminController.getTransactionSummary
);
router.get(
  "/commission-payouts",
  checkAuth(Role.ADMIN),
  AdminController.getCommissionPayouts
);

export const AdminRoutes = router;

