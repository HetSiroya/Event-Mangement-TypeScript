import { Router } from "express";
import adminController from "../controllers/adminController";
import { auth } from "../middlewares/token-decode";
import { isAdmin } from "../middlewares/roleChecker";
import { catchAsync } from "../utils/catchAsync";
import { uploadTo } from "../middlewares/multer";

const router = Router();

router.post("/setEvent", auth, isAdmin, catchAsync(adminController.setEvent));
router.post(
  "/uploadImage",
  auth,
  isAdmin,
  uploadTo("events").single("image"),
  catchAsync(adminController.uploadEventImage)
);
router.patch(
  "/updateEvent/:id",
  auth,
  isAdmin,
  catchAsync(adminController.updateEvent)
);
router.delete("/deleteEvent/:id", auth, isAdmin, catchAsync(adminController.deleteEvent));
// router.get("/getAllUsers", auth, isAdmin, catchAsync(adminController.getAllUsers));

// Download attendees CSV for a given event
router.get(
  "/downloadAttendees/:eventId",
  auth,
  isAdmin,
  catchAsync(adminController.downloadAttendeesCsv)
);

router.get("/getAllRigsterations" , auth , isAdmin , catchAsync(adminController.getAllRigsterations));

export default router;
