"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const agent_service_1 = require("./agent.service");
const getAgentDashboard = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const agentId = req.user.id;
    const dashboard = await agent_service_1.AgentService.getAgentDashboard(agentId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Agent dashboard retrieved retrieved. successfully",
        data: dashboard,
    });
});
exports.AgentController = {
    getAgentDashboard,
};
//# sourceMappingURL=agent.controller.js.map