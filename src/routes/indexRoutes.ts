import express from "express";
import { errorHandler } from "../middlewares/errorHandler";
const router = express.Router();
import authRoutes from "./authRoutes";
router.get("/", (req, res, next) => {
  try {
    res.send("Welcome to the College Event Management API!");
  } catch (error) {
    next(error);
  }
});

router.use("/auth", authRoutes);
// Error handling middleware
router.use(errorHandler);

export default router;
