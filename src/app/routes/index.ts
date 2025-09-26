import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRouts } from "../modules/user/user.router";

export const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "admin/users",
    route: UserRouts,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
