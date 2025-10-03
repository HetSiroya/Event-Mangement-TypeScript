import mongoose from "mongoose";
interface IEvent {
  title: string;
  description: string;
  date: Date;
  location: string;
  organizer: mongoose.Schema.Types.ObjectId;
  capacity: number;
  time: String;
  image: string;
  duration: String;
  price: String;
  category: string;
  isActive: boolean;
}

const eventSchema = new mongoose.Schema<IEvent>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, required: true },
  capacity: { type: Number, required: true },
  time: { type: String, required: true },
  image: { type: String, required: true },
  duration: { type: String, required: true },
  price: { type: String, required: true },
  category: { type: String, required: true },
  isActive: { type: Boolean, default: true },
});

const eventModel = mongoose.model<IEvent>("Event", eventSchema);
export default eventModel;
