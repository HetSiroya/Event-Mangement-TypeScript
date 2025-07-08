import { Router } from "express";
import adminController from "../controllers/adminController";
import { auth } from "../middlewares/token-decode";
import { isAdmin } from "../middlewares/roleChecker";
import { catchAsync } from "../utils/catchAsync";

const router = Router();

router.post("/setEvent", auth, isAdmin, catchAsync(adminController.setEvent));

export default router;
