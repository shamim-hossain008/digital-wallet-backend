import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../auth/auth.interface";
import { UserController } from "./user.controller";
import { updatedUserZodSchema } from "./user.validation";

const router = Router();

router.get("/all-users", checkAuth(Role.ADMIN), UserController.getAllUsers);
router.get("/me", checkAuth(...Object.values(Role)), UserController.getMe);
router.get(
  "/id",
  checkAuth(...Object.values(Role)),
  UserController.getSingleUser
);
router.patch(
  "/id",
  validateRequest(updatedUserZodSchema),
  checkAuth(...Object.values(Role)),
  UserController.updatedUser
);
router.delete(
  "/id",

  checkAuth(...Object.values(Role.ADMIN)),
  UserController.deleteUser
);

export const UserRouts = router;
