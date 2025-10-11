import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/appError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserService } from "./user.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await UserService.getAllUsers();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    data: users,
  });
});

// single user
const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    throw new AppError(httpStatus.BAD_REQUEST, "User ID is required");
  }

  const result = await UserService.getSingleUser(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User retrieved successfully",
    data: result.data,
  });
});

// updated user
const updatedUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id as string;
  const verifiedToken = req.user;
  const payload = req.body;
  const user = await UserService.updatedUser(
    userId,
    payload,
    verifiedToken as JwtPayload
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User updated successfully",
    data: user,
  });
});

const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const result = await UserService.getMe(decodedToken.id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Your profile retrieved successfully",
      data: result.data,
    });
  }
);
// delete user
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    throw new AppError(httpStatus.BAD_REQUEST, "User ID is required");
  }

  const result = await UserService.deleteUser(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User deleted successFully",
    data: result,
  });
});
export const UserController = {
  getAllUsers,
  getSingleUser,
  updatedUser,
  deleteUser,
  getMe,
};
