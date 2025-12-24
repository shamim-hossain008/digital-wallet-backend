import { Router } from "express";
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

router.post("/cash-in", checkAuth(Role.AGENT), AgentController.cashIn);

router.post("/cash-out", checkAuth(Role.AGENT), AgentController.cashOut);

export const AgentRoutes = router;
