import { Request, Response } from "express";
import eventModel from "../models/eventModel";

// Public/guest-facing controller
export const guestController = {
  // GET /guest/events?page=1&limit=10&search=music&category=Concert&from=2025-01-01&to=2025-12-31
  getEvents: async (req: Request, res: Response) => {
    try {
      const page = Math.max(parseInt((req.query.page as string) || "1", 10), 1);
      const limit = Math.max(parseInt((req.query.limit as string) || "10", 10), 1);
      const search = (req.query.search as string) || "";

      const filter: any = { isActive: true };

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ];
      }

    //   if (category) {
    //     filter.category = category;
    //   }

    //   if (from || to) {
    //     filter.date = {} as any;
    //     if (from) filter.date.$gte = new Date(from);
    //     if (to) filter.date.$lte = new Date(to);
    //   }

      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        eventModel
          .find(filter)
          .sort({ date: 1 })
          .skip(skip)
          .limit(limit),
        eventModel.countDocuments(filter),
      ]);

      const totalPages = Math.max(Math.ceil(total / limit), 1);

      return res.status(200).json({
        status: true,
        message: "Events fetched successfully",
        data: items,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        status: false,
        message: error?.message || "Something went wrong",
        data: "",
      });
    }
  },

  // GET /guest/events/:id
  getEventById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const event = await eventModel.findOne({ _id: id, isActive: true });
      if (!event) {
        return res.status(404).json({
          status: false,
          message: "Event not found",
          data: "",
        });
      }
      return res.status(200).json({
        status: true,
        message: "Event fetched successfully",
        data: event,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: false,
        message: error?.message || "Something went wrong",
        data: "",
      });
    }
  },
};

export default guestController;
