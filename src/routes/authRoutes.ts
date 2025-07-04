import express from "express";
import { authController } from "../controllers/authController";
import { catchAsync } from "../utils/catchAsync";
const router = express.Router();

router.post("/signup", catchAsync(authController.signUp));

export default router;
