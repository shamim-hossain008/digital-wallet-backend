import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../auth/auth.interface";
import { AgentController } from "./agent.controller";

const router = Router();

router.get(
  "/dashboard",
  checkAuth(Role.AGENT),
  AgentController.getAgentDashboard
);

export const AgentRoutes = router;

