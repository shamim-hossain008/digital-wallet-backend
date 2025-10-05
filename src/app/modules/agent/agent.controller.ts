import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AgentService } from "./agent.service";

const getAgentDashboard = catchAsync(async (req: Request, res: Response) => {
  const agentId = req.user!.userId;

  const dashboard = await AgentService.getAgentDashboard(agentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Agent dashboard retrieved retrieved. successfully",
    data: dashboard,
  });
});

export const AgentController = {
  getAgentDashboard,
};
