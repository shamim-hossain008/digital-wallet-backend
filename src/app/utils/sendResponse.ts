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
  data: T;
  meta?: TMeta;
}

export const sendResponse = <T>(
  res: Response,
  response: TResponse<T>
): void => {
  const { statusCode, success, message, data, meta } = response;

  res.status(statusCode).json({
    statusCode,
    success,
    message,
    meta,
    data,
  });
};
