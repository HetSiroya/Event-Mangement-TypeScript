import express from "express";
import { errorHandler } from "../middlewares/errorHandler";
const router = express.Router();
import authRoutes from "./authRoutes";
import adminRoutes from "./adminRoutes";
import event from "./userEventRoutes";
import { isVerified } from "../middlewares/isVerified";
import { auth } from "../middlewares/token-decode";
router.get("/", (req, res, next) => {
  try {
    res.send("Welcome to the College Event Management API!");
  } catch (error) {
    next(error);
  }
});

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/event", auth, isVerified, event);
// Error handling middleware
router.use(errorHandler);

export default router;
