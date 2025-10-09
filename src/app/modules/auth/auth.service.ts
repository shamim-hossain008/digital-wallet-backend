import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/appError";
import { generateToken } from "../../utils/jwt";
import { UserModel } from "../user/user.model";
import { WalletService } from "../wallet/wallet.service";
import { IAuthUser } from "./auth.interface";

const register = async (payload: IAuthUser) => { 
  console.log("Incoming role:", payload.role)
  const isUserExist = await UserModel.findOne({ email: payload.email });
  if (isUserExist) {
    throw new AppError(httpStatus.CONFLICT, "Email already registered");
  }
  const saltRounds = parseInt(envVars.BCRYPT_SALT_ROUND);
  const hashedPassword = await bcrypt.hash(payload.password, saltRounds);

  const user = await UserModel.create({ ...payload, password: hashedPassword });

  //   todo
  //  created wallet with 50tk bonus balance
  if (user.role === "USER" || user.role === "AGENT") {
    await WalletService.createWallet(user._id.toString());
  }

  return user;
};

const login = async (email: string, password: string) => {
  const user = await UserModel.findOne({ email });

  if (!user) throw new Error("User not found");

  if (!user.password) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "User password is missing"
    );
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) throw new Error("Invalid credentials");

  const payload = { id: user._id.toString(), role: user.role };

  const accessToken = generateToken(
    payload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  );

  const refreshToken = generateToken(
    payload,
    envVars.JWT_REFRESH_SECRET,
    envVars.JWT_REFRESH_EXPIRES
  );

  return { accessToken, refreshToken, user };
};

const approveAgent = async (agentId: string) => {
  return UserModel.findByIdAndUpdate(
    agentId,
    { isApproved: true },
    { new: true }
  );
};

const suspendAgent = async (agentId: string) => {
  return UserModel.findByIdAndUpdate(
    agentId,
    { isSuspended: true },
    { new: true }
  );
};
export const AuthService = {
  register,
  login,
  approveAgent,
  suspendAgent,
};
