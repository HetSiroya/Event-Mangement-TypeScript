import { Response } from "express";
import { CustomRequest } from "../middlewares/token-decode";
import eventModel from "../models/eventModel";
import { log } from "console";
import rigsterModel from "../models/rigsterModel";
import mongoose from "mongoose";

export const eventController = {
  rigster: async (req: CustomRequest, res: Response) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized: User ID is missing",
        });
      }
      const eventId = req.params.eventId;
      if (!eventId) {
        return res.status(400).json({
          status: false,
          message: "Event ID is required",
        });
      }
      const event = await eventModel.findById(eventId);
      if (!event) {
        return res.status(404).json({
          status: false,
          message: "Event not found",
        });
      }
      if (event.isActive === false) {
        return res.status(400).json({
          status: false,
          message: "Event is Not Active",
          data: "",
        });
      }
      const alreadyRigstered = await rigsterModel.findOne({
        eventId: mongoose.Types.ObjectId.createFromHexString(eventId),
        userId: mongoose.Types.ObjectId.createFromHexString(userId),
      });
      if (alreadyRigstered) {
        return res.status(400).json({
          status: false,
          message: "User already registered for this event",
          data: "",
        });
      }
      const newRigster = new rigsterModel({
        eventId: mongoose.Types.ObjectId.createFromHexString(eventId),
        userId: mongoose.Types.ObjectId.createFromHexString(userId),
      });
      await newRigster.save();
      return res.status(200).json({
        status: true,
        message: "New rigster successfully",
        data: newRigster,
      });
    } catch (error: any) {
      log("error", error.message);
      return res.status(400).json({
        status: false,
        message: "Something went wrong",
        data: "",
      });
    }
  },
};
