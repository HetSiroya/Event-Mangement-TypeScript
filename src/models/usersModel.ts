import mongoose from "mongoose";

interface IUser {
  name: string;
  email: string;
  mobileNumber: number;
  password: string;
  isVerified: boolean;
  role: string;
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  mobileNumber: {
    type: Number,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

const userModel = mongoose.model<IUser>("User", userSchema);
export default userModel;
