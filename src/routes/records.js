import { Router } from "express";
import {
    deleteRecordController,
    createRecordController,
    getAllRecordsController,
    updateRecordController
} from "../controllers/recordController.js"

import { auth } from "../middlewares/auth.js"
import { allow } from "../middlewares/rbac.js"

const router = Router();

router.get("/", auth, allow("VIEWER", "ANALYST", "ADMIN"), getAllRecordsController)
router.post("/", auth, allow("ADMIN"), createRecordController)
router.patch("/:id", auth, allow("ADMIN"), updateRecordController)
router.delete("/:id", auth, allow("ADMIN"), deleteRecordController)

export default router