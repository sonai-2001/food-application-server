import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import { Request, Response } from "express";
import sendMail from "../config/nodeMailer";
import { ApiError } from "../utils/ApiError";
import Food from "../models/food";
import User from "../models/user";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";

//!  ================= SELLER REGISTER =================
export const sellerRegister = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors.array().map(e => e.msg).join(", ");
    throw new ApiError(msg, 400, true);
  }

  const { ownerName, resturentName, email, password } = req.body;
  if (!email || !password) {
    throw new ApiError("Please enter all credentials", 400, true);
  }

  const existingSeller = await User.findOne({
    email: email.toLowerCase(),
    role: "seller",
  });

  if (existingSeller) {
    return res.status(400).json({
      status: 0,
      msg: "Seller already exists with this email",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const seller = new User({
    ownerName,
    resturentName,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: "seller",
  });

  await seller.save();

  const subject = `${resturentName}, Thanks for registering`;
  const message = `
    <h1 style="text-align:center;color:aqua">Hello ${ownerName}</h1>
    <div style="text-align:center">
      <p>Welcome to our family ❤️</p>
      <p>Please verify your email</p>
      <a href="http://127.0.0.1:3000/api/seller/auth/mail-verification?id=${seller._id}">
        <button style="background:cyan;border-radius:12px">Verify</button>
      </a>
    </div>
  `;

  sendMail(email, subject, message);

  res.status(201).json({
    status: 1,
    msg: "Seller registered successfully. Please verify your email",
  });
};

//!    ================= SELLER LOGIN =================
export const sellerLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError("Please enter both credentials", 400, true);
  }

  const seller = await User.findOne({
    email: email.toLowerCase(),
    role: "seller",
  });

  if (!seller) {
    throw new ApiError("Seller not found", 404, true);
  }

  //* Allow login only for active sellers
  if (seller.status !== "active") {
    throw new ApiError(
      seller.status === "pending"
        ? "Seller approval pending"
        : seller.status === "isDeleted"
        ? "Seller account has been deleted"
        : "Seller account is inactive",
      403,
      true
    );
  }

  const isValid = await bcrypt.compare(password, seller.password);
  if (!isValid) {
    throw new ApiError("Invalid credentials", 401, true);
  }

  const payload = {
    id: seller._id.toString(),
    email: seller.email,
    role: seller.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  res.status(200).json({
    status: 1,
    msg: `Welcome ${seller.resturentName}`,
    accessToken : accessToken,
    refreshToken : refreshToken,
  });
};

//!    ================= SELLER MAIL VERIFICATION =================
export const sellerMailVerification = async (req: Request, res: Response) => {
  const { id } = req.query;
  if (!id) {
    throw new ApiError("Invalid verification link", 400, true);
  }

  const seller = await User.findById(id);
  if (!seller || seller.role !== "seller") {
    throw new ApiError("Seller not found", 404, true);
  }

  if (seller.isVerified) {
    return res.json({
      msg: "Email already verified",
    });
  }

  seller.isVerified = true;
  await seller.save();

  res.json({
    msg: "Email verified successfully",
  });
};

//!    ================= ADD FOOD =================
export const addFood = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors.array().map(e => e.msg).join(", ");
    throw new ApiError(msg, 400, true);
  }

  const sellerId = req.user?.id;

  if (!sellerId || req.user?.role !== "seller") {
    throw new ApiError("Only sellers can add food", 403, true);
  }

  const seller = await User.findById(sellerId);
  if (!seller) {
    throw new ApiError("Seller not found", 404, true);
  }

  //* Only active sellers are allowed to add food
  if (seller.status !== "active") {
    throw new ApiError(
      seller.status === "pending"
        ? "Seller approval pending"
        : "Seller account is not active",
      403,
      true
    );
  }

  const { foodName, price } = req.body;

  if (!foodName || !price) {
    throw new ApiError("Food name and price are required", 400, true);
  }

  const food = new Food({
    foodName,
    price,
    resturentName: seller.resturentName,
  });

  await food.save();

  res.status(201).json({
    status: 1,
    msg: "Food item added successfully",
  });
};

//!    ================= SELLER SOFT DELETE (SELF) =================
export const deleteSellerSelf = async (req: Request, res: Response) => {
  const sellerId = req.user?.id;

  if (!sellerId || req.user?.role !== "seller") {
    throw new ApiError("Only sellers can delete their account", 403, true);
  }

  const seller = await User.findById(sellerId);
  if (!seller) {
    throw new ApiError("Seller not found", 404, true);
  }

  //* Soft delete seller
  seller.status = "isDeleted";
  await seller.save();

  res.status(200).json({
    status: 1,
    msg: "Seller account deleted successfully",
  });
};
