import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../auth/auth.interface";
import { AdminController } from "./admin.controller";

const router = Router();

router.get(
  "/transactions-summary",
  checkAuth(Role.ADMIN),
  AdminController.getTransactionSummary
);
// View commission summary calculated
router.get(
  "/commission-payouts",
  checkAuth(Role.ADMIN),
  AdminController.getCommissionSummary
);

//
router.get(
  "/commission-history",
  checkAuth(Role.ADMIN),
  AdminController.getCommissionHistory
);

router.get(
  "/commission-payouts/export",
  checkAuth(Role.ADMIN),
  AdminController.exportCommissionCSV
);

// Admin confirms and pays
router.post(
  "/commission-payouts/pay",
  checkAuth(Role.ADMIN),
  AdminController.payCommission
);

export const AdminRoutes = router;
