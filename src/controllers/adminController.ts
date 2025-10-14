import express, { Request, Response } from "express";
import { CustomRequest } from "../middlewares/token-decode";
import { checkRequiredFields } from "../helpers/commonValidator";
import eventModel from "../models/eventModel";
import { log } from "console";
import userModel from "../models/usersModel";
import rigsterModel from "../models/rigsterModel";
const adminController = {
  setEvent: async (req: CustomRequest, res: Response) => {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized: User ID is missing",
        data: "",
      });
    }

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
        capacity,
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
        "capacity",
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
        organizer: userId,
        title: title,
        description: description,
        date: new Date(date),
        location: location,
        attendees: attendees || [],
        time: time,
        image: image,
        duration: duration,
        price: price,
        category: category,
        capacity: capacity,
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

  uploadEventImage: async (req: CustomRequest, res: Response) => {
    try {
      const file = req.file;
      log("File received:", file);
      if (!file) {
        return res.status(400).json({
          status: false,
          message: "No file uploaded",
          data: "",
        });
      }
      return res.status(200).json({
        status: true,
        message: "File uploaded successfully",
        data: {
          filePath: file.path,
        },
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

  updateEvent: async (req: CustomRequest, res: Response) => {
    try {
      const eventId = req.params.id;
      // log("Event ID:", eventId);
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized: User ID is missing",
          data: "",
        });
      }
      const event = await eventModel.findById(eventId);

      if (!event) {
        return res.status(404).json({
          status: false,
          message: "Event not found",
          data: "",
        });
      }
      if (event.organizer.toString() !== userId.toString()) {
        return res.status(403).json({
          status: false,
          message: "Forbidden: You are not the organizer of this event",
          data: "",
        });
      }
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
        capacity,
      } = req.body;

      const data = {
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
        capacity,
      };
      const updatedEvent = await eventModel.findByIdAndUpdate(eventId, data, {
        new: true,
      });
      return res.status(200).json({
        status: true,
        message: "Event updated successfully",
        data: updatedEvent,
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

  deleteEvent: async (req: CustomRequest, res: Response) => {
    try {
      const eventId = req.params.id;
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized: User ID is missing",
          data: "",
        });
      }
      const event = await eventModel.findById(eventId);
      if (!event) {
        return res.status(404).json({
          status: false,
          message: "Event not found",
          data: "",
        });
      }
      if (event.organizer.toString() !== userId.toString()) {
        return res.status(403).json({
          status: false,
          message: "Forbidden: You are not the organizer of this event",
          data: "",
        });
      }
      await eventModel.findByIdAndDelete(eventId);
      return res.status(200).json({
        status: true,
        message: "Event deleted successfully",
        data: "",
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

  downloadAttendeesCsv: async (req: CustomRequest, res: Response) => {
    try {
      const { eventId } = req.params as { eventId: string };
      if (!eventId) {
        return res.status(400).json({
          status: false,
          message: "Event ID is required",
          data: "",
        });
      }

      // Ensure event exists
      const event = await eventModel.findById(eventId);
      if (!event) {
        return res.status(404).json({
          status: false,
          message: "Event not found",
          data: "",
        });
      }

      // Fetch registrations with user details
      const regs = await rigsterModel
        .find({ eventId })
        .populate("userId", "name email mobileNumber");

      // Prepare CSV rows
      const headers = [
        "eventId",
        "userId",
        "name",
        "email",
        "mobileNumber",
        "status",
        "registeredAt",
      ];

      const escape = (val: any) => {
        if (val === null || val === undefined) return "";
        const s = String(val);
        if (/[",\n]/.test(s)) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      };

      const rows = regs.map((r: any) => {
        const u = r.userId || {};
        return [
          eventId,
          r.userId?._id || "",
          u.name || "",
          u.email || "",
          u.mobileNumber || "",
          r.status || "",
          r.createdAt ? new Date(r.createdAt).toISOString() : "",
        ]
          .map(escape)
          .join(",");
      });

      const csv = [headers.join(","), ...rows].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="attendees-${eventId}.csv"`
      );
      return res.status(200).send(csv);
    } catch (error: any) {
      console.error("Error generating attendees CSV:", error.message);
      return res.status(500).json({
        status: false,
        message: "Internal server error",
        data: "",
      });
    }
  },

  getAllRigsterations : async (req : CustomRequest , res : Response) =>{
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized: User ID is missing",
          data: "",
        });
      }
      const rigsterions = await rigsterModel.find({userId : userId}).populate("eventId");
      if (!rigsterions || rigsterions.length === 0) {
        return res.status(404).json({
          status: false,
          message: "No rigsterions found for this user",
          data: "",
        });
      }
      return res.status(200).json({
        status: true,
        message: "Rigsterions fetched successfully",
        data: rigsterions,
      });
    } catch (error: any) {
      console.error("Error generating attendees CSV:", error.message);
      return res.status(500).json({
        status: false,
        message: "Internal server error",
        data: "",
      });
    }
  }
};

export default adminController;
