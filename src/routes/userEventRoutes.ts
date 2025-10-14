import express from "express";
import { eventController } from "../controllers/eventController";
import { catchAsync } from "../utils/catchAsync";
const router = express.Router();

router.post("/rigster/:eventId", catchAsync(eventController.rigster));
router.get(
  "/getRigstrations",

  catchAsync(eventController.getRigstrations)
);
router.get(
  "/getSigleEventRigstrations/:eventId",

  catchAsync(eventController.getSigleEventRigstrations)
);

export default router;
