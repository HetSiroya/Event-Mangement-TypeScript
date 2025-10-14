import { log } from "console";
import express, { Request, Response } from "express";
import { checkRequiredFields } from "../helpers/commonValidator";
import generateToken from "../helpers/token";
import userModel from "../models/usersModel";
import { comparePassword, hashPassword } from "../helpers/hased";
import { CustomRequest } from "../middlewares/token-decode";
import verifyModel from "../models/verifyModel";
import { generateOtp } from "../helpers/generateOtp";
import sendEmail from "../helpers/sendMail";
import { welcomeMail } from "../templates/welcome";
import { otpMail } from "../templates/otp";

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
      const Email = await sendEmail(
        newUser.email,
        "Welcome to Event Management",
        welcomeMail(newUser)
      );
      if (Email) {
        log("Email sent successfully");
      } else {
        log("Email not sent");
      }
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
      const { oldPassword, newPassword, confirmNewPassword } = req.body;
      // Validate old password
      const isMatch = await comparePassword(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          status: false,
          message: "Old password is incorrect",
          data: "",
        });
      }
      // Validate new password
      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({
          status: false,
          message: "New passwords do not match",
          data: "",
        });
      }
      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);
      // Update user password
      user.password = hashedNewPassword;
      await user.save();
      res.status(200).json({
        status: true,
        message: "Password changed successfully",
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
  // update profile
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
        _id: { $ne: userId },
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
  // verify Profile
  sendOtp: async (req: CustomRequest, res: Response) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(400).json({
          status: false,
          message: "User ID is required",
          data: "",
        });
      }
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
          data: "",
        });
      }
      // check if  already verified
      if (user.isVerified) {
        return res.status(400).json({
          status: false,
          message: "User is already verified",
          data: "",
        });
      }
      // Check if OTP already exists for the user
      let existingVerification = await verifyModel.findOne({
        userId: userId,
      });
      if (existingVerification) {
        existingVerification.otp = generateOtp();
        await existingVerification.save();
        return res.status(200).json({
          status: true,
          message: "OTP updated and sent successfully",
          data: existingVerification,
        });
      }
      // Generate OTP
      const newVerification = new verifyModel({
        email: user.email,
        userId: user._id,
        otp: generateOtp(),
      });
      await otpMail({ name: user.name, otp: newVerification.otp });
      // Save OTP to database
      await newVerification.save();
      return res.status(200).json({
        status: true,
        message: "OTP sent successfully",
        data: newVerification,
      });
    } catch (error: any) {
      console.log("Error during sending OTP:", error.message);
      res.status(500).json({
        status: false,
        message: "Something went wrong",
        data: "",
      });
    }
  },
  // verify OTP
  verifyOtp: async (req: CustomRequest, res: Response) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(400).json({
          status: false,
          message: "User ID is required",
          data: "",
        });
      }
      const { otp } = req.body;
      if (!otp) {
        return res.status(400).json({
          status: false,
          message: "OTP is required",
          data: "",
        });
      }
      // Find the OTP in the database
      const verification = await verifyModel.findOne({
        userId: userId,
        otp: otp,
      });
      if (!verification) {
        return res.status(400).json({
          status: false,
          message: "Invalid OTP",
          data: "",
        });
      }
      // OTP is valid, update user profile
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
          data: "",
        });
      }
      user.isVerified = true;
      // detele otp
      await verifyModel.deleteOne({ userId: userId, otp: otp });
      await user.save();
      return res.status(200).json({
        status: true,
        message: "OTP verified successfully",
        data: user,
      });
    } catch (error: any) {
      console.log("Error during OTP verification:", error.message);
      res.status(500).json({
        status: false,
        message: "Something went wrong",
        data: "",
      });
    }
  },
  // forgetPassword
  forgetPassword: async (req: Request, res: Response) => {
    try {
      const { email, otp, newPassword, confirmPassword } = req.body;
      // Validate email
      const user = await userModel.findOne({ email });
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
          data: "",
        });
      }

      // verify now the userr entered otp is correct or not
      const verification = await verifyModel.findOne({
        userId: user._id,
        otp: otp,
      });
      if (!verification) {
        return res.status(400).json({
          status: false,
          message: "Invalid OTP",
          data: "",
        });
      }
      // check user enter the password is same to old one
      const isMatch = await comparePassword(newPassword, user.password);
      if (isMatch) {
        return res.status(400).json({
          status: false,
          message: "New password cannot be the same as the old password",
          data: "",
        });
      }
      // Check if new password and confirm password match
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          status: false,
          message: "New password and confirm password do not match",
          data: "",
        });
      }
      // Hash the new password
      const hashedNewPassword = await hashPassword(newPassword);
      // Update user password
      user.password = hashedNewPassword;
      await user.save();
      // Delete the OTP after successful password reset
      await verifyModel.deleteOne({ userId: user._id, otp: otp });
      return res.status(200).json({
        status: true,
        message: "Password reset successfully",
        data: user,
      });

      // now chek that otp
    } catch (error: any) {
      console.log("Error during forget password:", error.message);
      res.status(500).json({
        status: false,
        message: "Something went wrong",
        data: "",
      });
    }
  },
  // send OTP check and set new  password
  sendOtpForForgetPassword: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      // Validate email
      const user = await userModel.findOne({
        email: email,
      });
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
          data: "",
        });
      }
      // Check if OTP already exists for the user
      let existingVerification = await verifyModel.findOne({
        userId: user._id,
      });
      if (existingVerification) {
        existingVerification.otp = generateOtp();
        await existingVerification.save();
        return res.status(200).json({
          status: true,
          message: "OTP updated and sent successfully",
          data: existingVerification,
        });
      }
      // Generate OTP
      const newVerification = new verifyModel({
        email: user.email,
        userId: user._id,
        otp: generateOtp(),
      });
      // Save OTP to database

      await newVerification.save();
      const data = await verifyModel.findOne({ userId: user._id });
      if (!data) {
        return res.status(404).json({
          status: false,
          message: "Error generating OTP",
          data: "",
        });
      }
      const detail = otpMail({ name: user.name, otp: data.otp });
      return res.status(200).json({
        status: true,
        message: "OTP sent successfully",
        data: newVerification,
      });
    } catch (error: any) {
      console.log("Error during forget password:", error.message);
      res.status(500).json({
        status: false,
        message: "Something went wrong",
        data: "",
      });
    }
  },

  getProfile: async (req: CustomRequest, res: Response) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(400).json({
          status: false,
          message: "User ID is required",
          data: "",
        });
      }
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
          data: "",
        });
      }
      return res.status(200).json({
        status: true,
        message: "User profile fetched successfully",
        data: user,
      });
    } catch (error: any) {
      console.log("Error during forget password:", error.message);
      res.status(500).json({
        status: false,
        message: "Something went wrong",
        data: "",
      });
    }
  },
};
