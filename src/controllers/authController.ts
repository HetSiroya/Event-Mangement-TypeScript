import { log } from "console";
import express, { Request, Response } from "express";
import { checkRequiredFields } from "../helpers/commonValidator";
import generateToken from "../helpers/token";
import userModel from "../models/usersModel";
import { comparePassword, hashPassword } from "../helpers/hased";
import { CustomRequest } from "../middlewares/token-decode";

export const authController = {
  // Sign Up function
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

  // Login function

  login: async (req: Request, res: Response) => {
    try {
      const { input, password } = req.body;
      // Check if input is email or mobile number
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
      const query = isEmail ? { email: input } : { mobileNumber: input };
      const user = await userModel.findOne(query);
      if (!user) {
        return res.status(400).json({
          status: false,
          message: "Invalid credentials",
          data: "",
        });
      }
      // Compare password
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          status: false,
          message: "Invalid Password",
          data: "",
        });
      }
      const tokenUser = {
        _id: user._id,
        role: user.role,
      };
      const token = generateToken(tokenUser);
      res.status(200).json({
        status: true,
        message: "Login successful",
        data: user,
        token: token,
      });
    } catch (error: any) {
      console.log("Error during login:", error.message);
      res.status(500).json({
        status: false,
        message: "Something went wrong",
        data: "",
      });
    }
  },

  // Change Password function
  changePassword: async (req: CustomRequest, res: Response) => {
    try {
      const userId = req.user._id; // Assuming user ID is stored in req.user
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
          data: "",
        });
      }
      // Validate old password
      const isMatch = await comparePassword(
        req.body.oldPassword,
        user.password
      );
      if (!isMatch) {
        return res.status(400).json({
          status: false,
          message: "Old password is incorrect",
          data: "",
        });
      }
      const { oldPassword, newPassword, confirmNewPassword } = req.body;
    } catch (error: any) {
      console.log("Error during login:", error.message);
      res.status(500).json({
        status: false,
        message: "Something went wrong",
        data: "",
      });
    }
  },

  updateProfile: async (req: CustomRequest, res: Response) => {
    try {
      const userId = req.user._id;
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
          data: "",
        });
      }
      const { name, email, mobileNumber } = req.body;
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: false,
          message: "Invalid email format",
          data: "",
        });
      }
      // Validate mobile number format
      const mobileNumberRegex = /^\d{10}$/;
      if (!mobileNumberRegex.test(mobileNumber)) {
        return res.status(400).json({
          status: false,
          message: "Mobile number must be 10 digits",
          data: "",
        });
      }

      // check if email or mobile number already exists
      const existUser = await userModel.findOne({
        $or: [{ email }, { mobileNumber }],
        _id: { $ne: userId }, // Exclude current user
      });
      if (existUser) {
        return res.status(400).json({
          status: false,
          message: "Email or mobile number already exists",
          data: "",
        });
      }
      // Update user profile
      user.name = name;
      user.email = email;
      user.mobileNumber = mobileNumber;
      await user.save();
      res.status(200).json({
        status: true,
        message: "Profile updated successfully",
        data: user,
      });
    } catch (error: any) {
      console.log("Error during login:", error.message);
      res.status(500).json({
        status: false,
        message: "Something went wrong",
        data: "",
      });
    }
  },
};
