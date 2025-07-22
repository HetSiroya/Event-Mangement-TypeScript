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

export default router;
