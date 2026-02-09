import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { uploadUserAvatar } from "../../middlewares/uploadUserImage";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../auth/auth.interface";
import { UserController } from "./user.controller";
import { updatedUserZodSchema } from "./user.validation";

const router = Router();
// Admin: list users
router.get("/all-users", checkAuth(Role.ADMIN), UserController.getAllUsers);
// current user
router.get("/me", checkAuth(...Object.values(Role)), UserController.getMe);

// updated current user profile
router.patch(
  "/update-profile",
  checkAuth(Role.USER),
  UserController.updatedMyProfile,
);

// Update profile Picture (expects multipart/form-data with file)
router.patch(
  "/profile/update-picture",
  checkAuth(Role.USER),
  uploadUserAvatar.single("picture"),
  UserController.updateUserProfile,
);
// Remove user Profile Picture
router.delete(
  "/profile/remove-picture",
  checkAuth(Role.USER),
  UserController.removeUserPicture,
);

// change User password
router.post(
  "/update-password",
  checkAuth(Role.USER),
  UserController.changePassword,
);

// 
router.get(
  "/lookup",
  checkAuth(...Object.values(Role)),
  UserController.lookupUser,
);

// single user (admin/agent)
router.get(
  "/:id",
  checkAuth(...Object.values(Role)),
  UserController.getUserProfile,
);
// update use(admin)
router.patch(
  "/:id",
  validateRequest(updatedUserZodSchema),
  checkAuth(...Object.values(Role)),
  UserController.updatedUser,
);
// delete user(admin)
router.delete(
  "/:id",

  checkAuth(Role.ADMIN),
  UserController.deleteUser,
);

export const UserRouts = router;
