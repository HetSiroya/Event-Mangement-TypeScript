import express from "express";
import { authController } from "../controllers/authController";
import { catchAsync } from "../utils/catchAsync";
import { auth } from "../middlewares/token-decode";
const router = express.Router();

router.post("/signup", catchAsync(authController.signUp));
router.post("/login", catchAsync(authController.login));
router.patch("/updatePassword", catchAsync(authController.changePassword));
router.patch("/updateProfile", auth, catchAsync(authController.updateProfile));
router.post("/sendOtp", auth, catchAsync(authController.sendOtp));
router.post("/verifyOtp", auth, catchAsync(authController.verifyOtp));
export default router;
