import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { registerUserZodSchema } from "../user/user.validation";
import { AuthController } from "./auth.controller";

const router = Router();

router.post(
  "/register",
  validateRequest(registerUserZodSchema),
  AuthController.register
);

router.post("/login", AuthController.login);

export const AuthRoutes = router;
