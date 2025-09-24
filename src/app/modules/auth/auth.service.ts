import bcrypt from "bcryptjs";
import { envVars } from "../../config/env";
import { generateToken } from "../../utils/jwt";
import { IAuthUser } from "./auth.interface";
import { AuthModel } from "./auth.model";

const register = async (payload: IAuthUser) => {
  const saltRounds = parseInt(envVars.BCRYPT_SALT_ROUND);
  const hashedPassword = await bcrypt.hash(payload.password, saltRounds);

  const user = await AuthModel.create({ ...payload, password: hashedPassword });

  //   todo
  //  created wallet with 50tk bonus balance
  return user;
};

const login = async (email: string, password: string) => {
  const user = await AuthModel.findOne({ email });

  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) throw new Error("Invalid credentials");

  const payload = { id: user._id, role: user.role };

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

export const AuthService = {
  register,
  login,
};
