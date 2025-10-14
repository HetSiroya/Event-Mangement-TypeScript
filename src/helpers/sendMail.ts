import express from "express";
require("dotenv").config();
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const transporter = nodemailer.createTransport({
  service: process.env.Service,
  host: process.env.Host,
  auth: {
    user: process.env.User,
    pass: process.env.Pass,
  },
  secure: true,
  port: process.env.Email_Port,
} as SMTPTransport.Options);

// Send an email using HTML body. Optionally include a plain text fallback.
const sendEmail = async (to: string, subject: string, html: string, text?: string) => {
  try {
    const mailOptions = {
      from: process.env.User,
      to,
      subject,
      // Prefer HTML emails; include text as fallback when provided
      html,
      text,
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email");
  }
};

export default sendEmail;
