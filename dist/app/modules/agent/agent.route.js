"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const auth_interface_1 = require("../auth/auth.interface");
const agent_controller_1 = require("./agent.controller");
const router = (0, express_1.Router)();
router.get("/dashboard", (0, checkAuth_1.checkAuth)(auth_interface_1.Role.AGENT), agent_controller_1.AgentController.getAgentDashboard);
exports.AgentRoutes = router;
//# sourceMappingURL=agent.route.js.map