import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: string;
  DB_URL: string;
  NODE_ENV: "development" | "production";

  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES: string;

  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CALLBACK_URL: string;
  EXPRESS_SESSION_SECRET: string;

  BCRYPT_SALT_ROUND: number;

  FRONTEND_URL: string;

  CLOUDINARY_NAME: string;
  CLOUDINARY_KEY: string;
  CLOUDINARY_SECRET: string;
}

const loadEnvVariables = (): EnvConfig => {
  const requiredEnvVariables: string[] = [
    "PORT",
    "DB_URL",
    "NODE_ENV",

    "JWT_ACCESS_SECRET",
    "JWT_ACCESS_EXPIRES",
    "JWT_REFRESH_SECRET",
    "JWT_REFRESH_EXPIRES",

    "BCRYPT_SALT_ROUND",
    "FRONTEND_URL",

    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CALLBACK_URL",
    "EXPRESS_SESSION_SECRET",

    "CLOUDINARY_NAME",
    "CLOUDINARY_KEY",
    "CLOUDINARY_SECRET",
  ];

  requiredEnvVariables.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing require environment variable ${key}`);
    }
  });

  // Parse and validate BCRYPT_SALT_ROUND
  const rawRounds = String(process.env.BCRYPT_SALT_ROUND).trim();
  const rounds = Number.parseInt(rawRounds, 10);
  if (Number.isNaN(rounds) || rounds <= 0) {
    throw new Error(
      `Invalid BCRYPT_SALT_ROUND value: "${process.env.BCRYPT_SALT_ROUND}". It must be a positive integer.`
    );
  }

  return {
    PORT: process.env.PORT as string,
    DB_URL: process.env.DB_URL as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",

    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,

    BCRYPT_SALT_ROUND: rounds,

    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,

    EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,

    CLOUDINARY_NAME: process.env.CLOUDINARY_NAME as string,
    CLOUDINARY_KEY: process.env.CLOUDINARY_KEY as string,
    CLOUDINARY_SECRET: process.env.CLOUDINARY_SECRET as string,
  };
};

export const envVars = loadEnvVariables();
