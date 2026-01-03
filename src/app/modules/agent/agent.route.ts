import { Router } from "express";
import { upload } from "../../config/multer";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../auth/auth.interface";
import { AgentController } from "./agent.controller";

const router = Router();

// dashboard
router.get(
  "/dashboard",
  checkAuth(Role.AGENT),
  AgentController.getAgentDashboard
);

// agent profile
router.get("/profile", checkAuth(Role.AGENT), AgentController.getAgentProfile);

router.patch(
  "/profile",
  checkAuth(Role.AGENT),
  upload.single("photo"),
  AgentController.updatedAgentProfile
);

// change password
router.patch(
  "/change-password",
  checkAuth(Role.AGENT),
  AgentController.changeAgentPassword
);
// Transactions
router.get(
  "/transactions",
  checkAuth(Role.AGENT),
  AgentController.getAgentTransactions
);

// Cash-in
router.post("/cash-in", checkAuth(Role.AGENT), AgentController.cashIn);
// Cash-out
router.post("/cash-out", checkAuth(Role.AGENT), AgentController.cashOut);

export const AgentRoutes = router;
