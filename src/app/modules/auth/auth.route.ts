import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { registerUserZodSchema } from "../user/user.validation";
import { AuthController } from "./auth.controller";
import { Role } from "./auth.interface";

const router = Router();

router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);

router.post(
  "/register",
  validateRequest(registerUserZodSchema),
  AuthController.register
);

router.patch(
  "/approve/:id",
  checkAuth(Role.ADMIN),
  AuthController.approveAgent
);
router.patch(
  "/suspend/:id",
  checkAuth(Role.ADMIN),
  AuthController.suspendAgent
);

export const AuthRoutes = router;
