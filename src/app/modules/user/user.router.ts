import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../auth/auth.interface";
import { UserController } from "./user.controller";

const router = Router();

router.get("/all-users", checkAuth(Role.ADMIN), UserController.getAllUsers);

export const UserRouts = router;
