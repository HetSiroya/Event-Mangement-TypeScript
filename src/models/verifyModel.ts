import mongoose, { Document, Schema } from "mongoose";

export interface IVerify extends Document {
  email: string;
  userID: mongoose.Types.ObjectId;
  otp: string;
}

const VerifySchema: Schema = new Schema(
  {
    email: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    otp: { type: String, required: true },
  },
  { timestamps: true }
);

const verifyModel = mongoose.model<IVerify>("Verify", VerifySchema);
export default verifyModel;
