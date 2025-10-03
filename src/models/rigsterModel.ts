import mongoose from "mongoose";

interface IRigster {
  eventId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  status: string;
}
const rigsterSchema = new mongoose.Schema<IRigster>(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["registered", "cancelled"],
      default: "registered",
    },
  },
  { timestamps: true }
);

const rigsterModel = mongoose.model<IRigster>("Rigster", rigsterSchema);
export default rigsterModel;
