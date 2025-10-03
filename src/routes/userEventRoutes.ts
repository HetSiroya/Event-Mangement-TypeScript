import express from "express";
import { eventController } from "../controllers/eventController";
import { catchAsync } from "../utils/catchAsync";
import { auth } from "../middlewares/token-decode";
const router = express.Router();

router.post("/rigster/:eventId", auth, catchAsync(eventController.rigster));

export default router;
