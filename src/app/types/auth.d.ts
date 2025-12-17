export interface IAuthJwtPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}
