import mongoose from "mongoose";
interface IEvent {
  title: string;
  description: string;
  date: Date;
  location: string;
  organizer: string;
  capacity: number;
  time: Date;
  image: string;
  duration: number;
  price: number;
  category: string;
  isActive: boolean;
}

const eventSchema = new mongoose.Schema<IEvent>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  organizer: { type: String, required: true },
  capacity: { type: Number, required: true },
  time: { type: Date, required: true },
  image: { type: String, required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  isActive: { type: Boolean, required: true },
});

export const eventModel = mongoose.model<IEvent>("Event", eventSchema);
