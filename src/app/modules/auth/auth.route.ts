import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import { envVars } from "../../config/env";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { registerUserZodSchema } from "../user/user.validation";
import { AuthController } from "./auth.controller";
import { Role } from "./auth.interface";

const router = Router();

router.post("/logout", AuthController.logout);
router.post("/login", AuthController.credentialsLogin);
// router.post("/credentials-login", AuthController.credentialsLogin),
router.post("/refresh-token", AuthController.getNewAccessToken);

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

// /api/v1/auth/google
router.get(
  "/google",
  async (req: Request, res: Response, next: NextFunction) => {
    const redirect = req.query.redirect || "/";
    passport.authenticate("google", {
      scope: ["profile", "email"],
      state: redirect as string,
    })(req, res, next);
  }
);

//api/v1/auth/google/callback?state
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${envVars.FRONTEND_URL}/login?error=There is some issues with your account. Please contact with out support team!`,
  }),
  AuthController.googleCallbackController
);

export const AuthRoutes = router;
