import express from "express";
import { guestController } from "../controllers/guestController";
import { catchAsync } from "../utils/catchAsync";

const router = express.Router();
router.get("/events", catchAsync(guestController.getEvents));
router.get("/events/:id", catchAsync(guestController.getEventById));

export default router;
