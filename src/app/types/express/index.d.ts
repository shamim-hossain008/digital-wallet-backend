import { IAuthJwtPayload } from "../auth";

declare global {
  namespace Express {
    interface Request {
      user?: IAuthJwtPayload;
    }
  }
}
