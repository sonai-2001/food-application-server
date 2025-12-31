import bcrypt from "bcrypt";
import sendMail from "../config/nodeMailer";
import { validationResult } from "express-validator";
import { Request, Response } from "express";
import User from "../models/user";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";


//!   Register Controller ~

export const userRegister = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors
        .array()
        .map((e: any) => e.msg)
        .join(", ");

      return res.status(400).json({
        status: 0,
        msg: errorMessages,
      });
    }

    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      return res.status(400).json({
        status: 0,
        msg: "Please enter all credentials",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      role: "user",
    });

    if (existingUser) {
      return res.status(400).json({
        status: 0,
        msg: "User already exists",
      });
    }

    const hashpass = await bcrypt.hash(password, 10);

    const user = await User.create({
      userName,
      email: email.toLowerCase(),
      password: hashpass,
      role: "user",
      isVerified: false,
    });

    const sub = `${userName}, Thanks for registering`;
    const msg = `
      <h1>Hello ${userName}</h1>
      <p>Please verify your email</p>
      <a href="http://127.0.0.1:3000/api/user/auth/mail-verification?id=${user._id}">
        Verify
      </a>
    `;

    sendMail(email, sub, msg);

    return res.status(201).json({
      status: 1,
      msg: "User registered successfully",
    });
  } catch (err: any) {
    return res.status(500).json({
      status: 0,
      msg: "There is some problem in user registration",
      error: err.message,
    });
  }
};


//!   LOGIN Controller ~

export const userLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 0,
        msg: "Please enter both credentials",
      });
    }

    const foundUser = await User.findOne({
      email: email.toLowerCase(),
      role: "user",
    });

    if (!foundUser) {
      return res.status(400).json({
        status: 0,
        msg: "Please register first",
      });
    }

    const isValid = await bcrypt.compare(password, foundUser.password);

    if (!isValid) {
      return res.status(400).json({
        status: 0,
        msg: "Please check your password",
      });
    }

    const payload = {
      id: foundUser._id.toString(),
      email: foundUser.email,
      role: foundUser.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return res.status(200).json({
      status: 1,
      msg: `Welcome ${foundUser.userName}`,
      accessToken : accessToken,
      refreshToken : refreshToken,
    });
  } catch (err: any) {
    return res.status(500).json({
      status: 0,
      msg: "There is some problem in login",
      error: err.message,
    });
  }
};


//!   Mail - Verification Controller ~

export const userMailVerification = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        status: 0,
        msg: "Invalid verification link",
      });
    }

    const foundUser = await User.findOne({ _id: id, role: "user" });

    if (!foundUser) {
      return res.status(404).json({
        status: 0,
        msg: "User not found",
      });
    }

    if (foundUser.isVerified) {
      return res.status(200).json({
        status: 1,
        msg: "Email already verified",
      });
    }

    foundUser.isVerified = true;
    await foundUser.save();

    return res.status(200).json({
      status: 1,
      msg: "Email verified successfully",
    });
  } catch (err: any) {
    return res.status(500).json({
      status: 0,
      msg: "Email verification failed",
      error: err.message,
    });
  }
};


//!   SendMailVeirification Controller ~

export const sendMailVerification = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 0,
        msg: "Please provide a valid email address",
      });
    }

    const { email } = req.body;

    const foundUser = await User.findOne({
      email: email.toLowerCase(),
      role: "user",
    });

    if (!foundUser) {
      return res.status(404).json({
        status: 0,
        msg: "Please register first",
      });
    }

    if (foundUser.isVerified) {
      return res.status(200).json({
        status: 1,
        msg: "Email already verified",
      });
    }

    const msg = `
      <p>
        Hi ${foundUser.userName},
        Please <a href="http://127.0.0.1:3000/api/user/auth/mail-verification?id=${foundUser._id}">
        verify</a> your email.
      </p>
    `;

    sendMail(email, "Verification Mail", msg);

    return res.status(200).json({
      status: 1,
      msg: "Verification mail sent",
    });
  } catch (err: any) {
    return res.status(500).json({
      status: 0,
      msg: "Failed to send verification mail",
      error: err.message,
    });
  }
};
