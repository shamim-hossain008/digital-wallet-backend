import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { Types } from "mongoose";
import AppError from "../../errorHelpers/appError";
import { IAuthJwtPayload } from "../../types/auth";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserModel } from "./user.model";
import { UserService } from "./user.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

// single user
const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    throw new AppError(httpStatus.BAD_REQUEST, "User ID is required");
  }

  const result = await UserService.getUserProfile(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User retrieved successfully",
    data: result,
  });
});

// updated user
const updatedUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id as string;
  const verifiedToken = req.user as IAuthJwtPayload;
  const payload = req.body;
  const user = await UserService.updatedUser(userId, payload, verifiedToken);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User updated successfully",
    data: user,
  });
});

const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authUser = req.user as IAuthJwtPayload;

    if (!authUser?.sub) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token payload");
    }
    const result = await UserService.getMe(authUser.sub);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Your profile retrieved successfully",
      data: result,
    });
  },
);
// update My Profile
const updatedMyProfile = catchAsync(async (req: Request, res: Response) => {
  const authUser = req.user as IAuthJwtPayload;

  if (!authUser?.sub) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token");
  }

  const payload = req.body;

  const updatedUser = await UserService.updatedMyProfile(authUser.sub, payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile updated successfully",
    data: updatedUser,
  });
});

// Remove profile picture
const removeUserPicture = catchAsync(async (req: Request, res: Response) => {
  const authUser = req.user as IAuthJwtPayload;
  if (!authUser?.sub)
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token");

  const updated = await UserService.removeUserPicture(authUser.sub);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile picture remove successfully",
    data: updated,
  });
});
// Updated User Profile

const updateUserProfile = catchAsync(async (req: Request, res: Response) => {
  const authUser = (req.user as IAuthJwtPayload).sub;
  if (!authUser) throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token");

  const payload = {
    ...req.body,
    picture: req.file?.path,
    picturePublicId: req.file?.filename,
  };
  const updated = await UserService.updateUserProfile(authUser, payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile updated successfully",
    data: updated,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const authUser = req.user as IAuthJwtPayload;

  if (!authUser?.sub)
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token");

  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Old and new password are required",
    );
  }

  await UserService.changePassword(authUser.sub, oldPassword, newPassword);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Password updated successfully",
    data: null,
  });
});

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

//
const lookupUser = catchAsync(async (req: Request, res: Response) => {
  const identifier = String(req.query.identifier || "").trim();
  if (!identifier) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "identifier query param is required",
    );
  }
  let user = null;
  // try object id
  if (Types.ObjectId.isValid(identifier)) {
    user = await UserModel.findById(identifier).select("_id email phone name");
  }
  // try email
  if (!user) {
    user = await UserModel.findOne({ email: identifier }).select(
      "_id email phone name",
    );
  }
  // try phone
  if (!user) {
    user = await UserModel.findOne({ phone: identifier }).select(
      "_id email phone name",
    );
  }

  if (!user) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "User not found",
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User found",
    data: {
      id: user._id.toString(),
      email: user.email,
      phone: user.phone,
      name: user.name,
    },
  });
});

export const UserController = {
  getAllUsers,
  getUserProfile,
  updatedUser,
  updatedMyProfile,
  deleteUser,
  getMe,
  removeUserPicture,
  updateUserProfile,
  changePassword,
  lookupUser,
};
