import express from "express";
import { Response, NextFunction } from "express";
import { CustomRequest } from "./token-decode";

import { catchAsync } from "../utils/catchAsync";
import { auth } from "../middlewares/token-decode";
import adminController from "../controllers/adminController";
const router = express.Router();

router.post("/setEvent", auth, catchAsync(adminController.setEvent));

export const isAdmin = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (!user || user.role !== "admin") {
    throw new Error("Access denied only Admin can access this page ");
  }
  next();
};
