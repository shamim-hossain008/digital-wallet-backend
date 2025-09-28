import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/appError";
import { Role } from "../auth/auth.interface";
import { IUser } from "./user.interface";
import { UserModel } from "./user.model";

// get All users
const getAllUsers = async (): Promise<IUser[]> => {
  return UserModel.find({ isDeleted: false });
};
// get single user
const getSingleUser = async (id: string) => {
  const user = await UserModel.findById(id).select("-password");
  return {
    data: user,
  };
};
//  update user
const updatedUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  const ifUserExist = await UserModel.findById(userId);

  if (!ifUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  if (payload.email) {
    throw new AppError(httpStatus.FORBIDDEN, "Email cannot be Updated");
  }

  if (payload.role === Role.USER || decodedToken.role === Role.AGENT)
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");

  if (payload.role === Role.AGENT && decodedToken.role === Role.ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
  }
  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }
  //  pass hashing
  if (payload.password) {
    payload.password = await bcryptjs.hash(
      payload.password,
      envVars.BCRYPT_SALT_ROUND
    );
  }
  const newUpdateUser = await UserModel.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return newUpdateUser;
};

const getMe = async (userId: string) => {
  const user = await UserModel.findById(userId).select("-password");

  return {
    data: user,
  };
};
// Delete user
const deleteUser = async (id: string): Promise<IUser | null> => {
  return UserModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};
export const UserService = {
  getAllUsers,
  getSingleUser,
  updatedUser,
  deleteUser,
  getMe,
};
