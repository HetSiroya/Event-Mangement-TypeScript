import express, { Request, Response } from "express";
import { CustomRequest } from "../middlewares/token-decode";
import { checkRequiredFields } from "../helpers/commonValidator";
import { eventModel } from "../models/eventModel";

const adminController = {
  setEvent: async (req: CustomRequest, res: Response) => {
    try {
      const {
        title,
        description,
        date,
        location,
        attendees,
        time,
        image,
        duration,
        price,
        category,
      } = req.body;
      const requiredFields = [
        "title",
        "description",
        "date",
        "location",
        "time",
        "image",
        "duration",
        "price",
        "category",
      ];
      const validationError = checkRequiredFields(req.body, requiredFields);
      if (validationError) {
        return res.status(400).json({
          status: false,
          message: validationError,
          data: "",
        });
      }
      const newEvent = new eventModel({
        title: title,
        description: description,
        date: new Date(date),
        location: location,
        attendees: attendees || [],
        time: new Date(time),
        image: image,
        duration: duration,
        price: price,
        category: category,
      });
      await newEvent.save();
      return res.status(201).json({
        status: true,
        message: "Event created successfully",
        data: newEvent,
      });
    } catch (error: any) {
      console.error("Error creating event:", error.message);
      return res.status(500).json({
        status: false,
        message: "Internal server error",
        data: "",
      });
    }
  },
};

export default adminController;
