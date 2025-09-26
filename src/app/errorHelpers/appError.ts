import { StatusCodes } from "http-status-codes";

class AppError extends Error {
  public statusCode: number;

  constructor(
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    message: string,
    stack = ""
  ) {
    super(message);

    this.statusCode = statusCode;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default AppError;
