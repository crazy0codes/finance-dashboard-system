import { Router } from "express";
import { registerController, loginController } from "../controllers/authController.js";
import { validateLogin, validateRegister } from "../validations/authValidation.js"

const router = Router();

router.post('/register', validateRegister, registerController);
router.post('/login', validateLogin, loginController);

export default router;