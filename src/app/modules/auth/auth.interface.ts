export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
  AGENT = "AGENT",
}

export interface IAuthUser {
  name: string;
  email: string;
  role: Role;
  password: string;
  isApproved?: boolean;
}
