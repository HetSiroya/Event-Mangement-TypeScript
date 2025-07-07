import express from "express";
import { authController } from "../controllers/authController";
import { catchAsync } from "../utils/catchAsync";
const router = express.Router();

router.post("/signup", catchAsync(authController.signUp));
router.post("/login", catchAsync(authController.login));
router.patch("/updatePassword", catchAsync(authController.changePassword)); 

export default router;
