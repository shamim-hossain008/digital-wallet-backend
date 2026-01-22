import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { uploadAdminAvatar } from "../../middlewares/uploadAdminImage";
import { Role } from "../auth/auth.interface";
import { AdminController } from "./admin.controller";

const router = Router();

//  Admin dashboard
router.get(
  "/dashboard",
  checkAuth(Role.ADMIN),
  AdminController.getAdminDashboard
);

// Admin Summary
router.get("/summary", checkAuth(Role.ADMIN), AdminController.getAdminSummary);

// agents
router.get("/all-agents", checkAuth(Role.ADMIN), AdminController.getAllAgents);

// Commission summary (unpaid payouts)
router.get(
  "/commission-payouts",
  checkAuth(Role.ADMIN),
  AdminController.getCommissionSummary
);

// Commission history (paid records)
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

router.patch(
  "/users/:userId/block",
  checkAuth(Role.ADMIN),
  AdminController.toggleUserBlock
);

router.patch(
  "/users/:userId/role",
  checkAuth(Role.ADMIN),
  AdminController.updateUserRole
);

// Admin Profile
router.get("/profile", checkAuth(Role.ADMIN), AdminController.getAdminProfile);

// Admin Profile update (name/phone+optional picture upload)
router.patch(
  "/profile",
  checkAuth(Role.ADMIN),
  uploadAdminAvatar.single("picture"),
  AdminController.updatedAdminProfile
);

// Admin profile picture remove
router.delete(
  "/profile/picture",
  checkAuth(Role.ADMIN),
  AdminController.removeAdminPicture
);

// Admin Password change
router.patch(
  "/profile/change-password",
  checkAuth(Role.ADMIN),
  AdminController.changeAdminPassword
);

export const AdminRoutes = router;
