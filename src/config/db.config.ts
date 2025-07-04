import dotenv from "dotenv";
require("dotenv").config();
import mongoose from "mongoose";

const dbUrl: string = process.env.MongoDB_URI as string;
const connetDB = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log("MongoDB Connected...");
  } catch (error: any) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connetDB;
