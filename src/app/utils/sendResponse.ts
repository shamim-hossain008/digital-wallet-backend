import { Response } from "express";

interface TMeta {
  total: number;
  page?: number;
  limit?: number;
}

interface TResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T | null;
  meta?: TMeta;
}

export const sendResponse = <T>(
  res: Response,
  response: TResponse<T>,
): void => {
  const { statusCode, success, message, data, meta } = response;

  // Ensure responses are not cached by clients/proxies
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  res.status(statusCode).json({
    statusCode,
    success,
    message,
    meta,
    data,
  });
};
