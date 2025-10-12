"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentDashboardFilterSchema = exports.suspendAgentSchema = exports.approveAgentSchema = void 0;
const zod_1 = require("zod");
exports.approveAgentSchema = zod_1.z.object({
    agentId: zod_1.z.string().min(1, "Agent ID is required"),
});
exports.suspendAgentSchema = zod_1.z.object({
    agentId: zod_1.z.string().min(1, "Agent ID is required"),
});
exports.agentDashboardFilterSchema = zod_1.z.object({
    status: zod_1.z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]).optional(),
    fromDate: zod_1.z.string().optional(),
    toDate: zod_1.z.string().optional(),
});
//# sourceMappingURL=agent.validation.js.map