
import { Router } from "express";
import {
    deleteUserController,
    getAllUserController,
    updateUserRoleController,
    updateUserStatusController
} from "../controllers/userController.js"
import { allow } from "../middlewares/rbac.js"
import { auth } from "../middlewares/auth.js"

const router = Router();

router.get("/", auth, allow("ADMIN"), getAllUserController)
router.patch("/:id/role", auth, allow("ADMIN"), updateUserRoleController)
router.patch("/:id/status",auth, allow("ADMIN"), updateUserStatusController)
router.delete("/:id", auth, allow("ADMIN"), deleteUserController)

export default router
