import { log } from "console";
import express, { Request, Response } from "express";
import { checkRequiredFields } from "../helpers/commonValidator";
import generateToken from "../helpers/token";
import userModel from "../models/usersModel";
import { hashPassword } from "../helpers/hased";

export const authController = {
  signUp: async (req: Request, res: Response) => {
    try {
      const { name, email, password, confirmPassword, mobileNumber } = req.body;
      const existUser = await userModel.findOne({
        $or: [{ email }, { mobileNumber }],
      });
      if (existUser) {
        return res.status(400).json({
          status: false,
          message: "User already exists with this email or mobile number",
          data: "",
        });
      }
      //   required fields validation
      const requiredFields = [
        "name",
        "email",
        "password",
        "confirmPassword",
        "mobileNumber",
      ];
      const validationError = checkRequiredFields(req.body, requiredFields);
      if (validationError) {
        return res.status(400).json({
          status: false,
          message: validationError,
          data: "",
        });
      }
      //   password match validation
      if (password !== confirmPassword) {
        return res.status(400).json({
          status: false,
          message: "Passwords do not match",
          data: "",
        });
      }
      const hasedPassword = await hashPassword(password);
      //   email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: false,
          message: "Invalid email format",
          data: "",
        });
      }
      //   mobile number validation
      const mobileNumberRegex = /^\d{10}$/;
      if (!mobileNumberRegex.test(mobileNumber)) {
        return res.status(400).json({
          status: false,
          message: "Mobile number must be 10 digits",
          data: "",
        });
      }
      // token generation and user creation logic would go here
      const newUser = new userModel({
        name: name,
        email: email,
        password: hasedPassword,
        mobileNumber: mobileNumber,
      });
      const tokenUser = {
        _id: newUser._id,
        role: newUser.role,
      };
      const token = generateToken(tokenUser);
      await newUser.save();
      return res.status(200).json({
        status: true,
        message: "User created successfully",
        data: newUser,
        token: token,
      });
    } catch (error: any) {
      console.log("Error during sign up:", error.message);
      return res.status(500).json({
        status: false,
        message: "something went wrong",
        data: "",
      });
    }
  },
  login: (req: Request, res: Response) => {
    res.status(200).json({
      message: "Login successful",
      user: {
        id: 1,
        name: "John Doe",
        email: "",
      },
    });
  },
};
