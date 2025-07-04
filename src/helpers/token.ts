import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";

interface User {
  _id: any;
  role: string;
}

function generateToken(user: User): string {
  let jwtSecret: string = process.env.JWT_SECRET_KEY || "gfg_jwt_secret_key";
  const token: string = jwt.sign(user, jwtSecret);
  return token;
}

export default generateToken;
