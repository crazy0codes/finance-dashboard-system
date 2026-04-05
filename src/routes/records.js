import { Router } from "express";
import {
    deleteRecordController,
    createRecordController,
    getAllRecordsController,
    updateRecordController
} from "../controllers/recordController.js"
import {
    validateCreateRecord,
    validateUpdateRecord,
    validateDeleteRecord,
    validateGetAllRecords
} from "../validations/recordValidation.js";
import { auth } from "../middlewares/auth.js"
import { allow } from "../middlewares/rbac.js"

const router = Router();

router.get("/", auth, allow("VIEWER", "ANALYST", "ADMIN"), validateGetAllRecords, getAllRecordsController);
router.post("/", auth, allow("ADMIN"), validateCreateRecord, createRecordController);
router.patch("/:id", auth, allow("ADMIN"), validateUpdateRecord, updateRecordController);
router.delete("/:id", auth, allow("ADMIN"), validateDeleteRecord, deleteRecordController);


export default router