import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../auth/auth.interface";
import { UserController } from "./user.controller";
import { updatedUserZodSchema } from "./user.validation";

const router = Router();
// all user route
router.get("/all-users", checkAuth(Role.ADMIN), UserController.getAllUsers);
// user profile
router.get("/me", checkAuth(...Object.values(Role)), UserController.getMe);
// single user route
router.get(
  "/:id",
  checkAuth(...Object.values(Role)),
  UserController.getSingleUser
);
// update user
router.patch(
  "/:id",
  validateRequest(updatedUserZodSchema),
  checkAuth(...Object.values(Role)),
  UserController.updatedUser
);
// delete user
router.delete(
  "/:id",

  checkAuth(Role.ADMIN),
  UserController.deleteUser
);

export const UserRouts = router;
