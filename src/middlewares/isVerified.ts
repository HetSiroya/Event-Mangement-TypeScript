import { Request, Response, NextFunction } from "express";
import { CustomRequest } from "./token-decode";
import userModel from "../models/usersModel";

export async function isVerified(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error("User ID not found in request.");
    }

    const user = await userModel.findById(userId);
    if (user && user.isVerified) {
      return next();
    }

    throw new Error("Profile is not verified.");
  } catch (err) {
    next(err);
  }
}
