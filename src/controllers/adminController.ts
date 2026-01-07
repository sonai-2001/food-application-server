import bcrypt from "bcrypt";
import sendMail from "../config/nodeMailer";
import { ApiError } from "../utils/ApiError";
import { validationResult } from "express-validator";
import User from "../models/user";
import { Request, Response } from "express";
import {
  generateAccessToken,
  generateRefreshToken,
  JwtPayload,
} from "../utils/jwt";
import Food from "../models/food";

//!     REGISTER API ~
export const adminRegister = async (req: Request, res: Response) => {
  try {
    const errors: any = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors
        .array()
        .map((e: any) => e.msg)
        .join(", ");
      throw new ApiError(errorMessages, 400, true);
      // console.log(errors);
    }

    const { userName, email, password } = req.body;
    if (!email || !password || !userName) {
      throw new ApiError("Please enter both credentials", 400, true);
    }
    const hashpass = await bcrypt.hash(password, 10);
    const userCredentials = {
      userName: userName,
      email: email.toLowerCase(),
      password: hashpass,
      role: "admin",
    };
    const newAdmin = new User(userCredentials);
    await newAdmin.save();

    const sub = `${userName} , Admin wellcome to our website ...`;
    const msg = `<h1 style="text-align: center; color : aqua">Hello ${userName}</h1>
    <div style="text-align: center;">
        <p>Wellcome to our familly , hope u will like this as much we want u to do ...</p>
        <p>This is in the dev version , so obviously it will be much better in the future .. so be with us ❤️</p>
        <p style="opacity: .2;"> Please click the button to verify ur email ... </p>
        <a href="http://127.0.0.1:3000/api/admin/auth/mail-verification?id=${newAdmin?._id}">
            <button style="background-color: cyan; border-radius: 12px; padding :3px; font-size: 16px ; padding-left: 5px; padding-right: 5px;">
            Verify
        </button>
        </a>
    </div>`;
    sendMail(email, sub, msg);

    res.status(201).json({
      msg: "Admin has been registered successfully ...",
    });
  } catch (err: any) {
    return res.status(500).json({
      status: 0,
      msg: "There is some problem in admin registration ... ",
      error: err.message,
    });
  }
};

//!    ================= ADMIN SOFT DELETE SELLER =================
export const deleteSellerByAdmin = async (req: Request, res: Response) => {
  try {
    //* Admin-only check
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        status: 0,
        msg: "Admins only",
      });
    }

    const { sellerId } = req.params;

    if (!sellerId) {
      return res.status(400).json({
        status: 0,
        msg: "Seller ID is required",
      });
    }

    const seller = await User.findOne({
      _id: sellerId,
      role: "seller",
    });

    if (!seller) {
      return res.status(404).json({
        status: 0,
        msg: "Seller not found",
      });
    }

    //* Soft delete seller
    seller.status = "isDeleted";
    await seller.save();

    return res.status(200).json({
      status: 1,
      msg: "Seller deleted successfully by admin",
      sellerId: seller._id,
    });
  } catch (err: any) {
    return res.status(500).json({
      status: 0,
      msg: err.message,
    });
  }
};

//!     Login Api ~
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError("Please enter both credentials", 400, true);
    }
    const foundAdmin = await User.findOne({
      email: email.toLowerCase(),
      role: "admin",
    });

    if (!foundAdmin) {
      throw new ApiError("Please register first ...", 400, true);
    }

    //using the hashed pass so compare it ...
    const isValid = await bcrypt.compare(password, foundAdmin.password);

    if (!isValid) {
      return res.status(400).json({
        status: 0,
        msg: "Please check ur password ... ",
      });
    }

    //* JWT PAYLOAD
    const payload: JwtPayload = {
      id: foundAdmin._id.toString(),
      email: foundAdmin.email,
      role: "admin",
    };

    //* Generate Tokens ~
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const msg = `<h1 style="text-align: center; color : aqua">Hello ${foundAdmin.userName}</h1>
      <div style="text-align: center;">
        <p>Your account was logged in successfully.</p>
        <p>If this was not you, please secure your account.</p>
      </div>`;

    sendMail(email, "Login Alert", msg);

    //* Final Response ~
    return res.status(200).json({
      status: 1,
      msg: `Wellcoome ${foundAdmin.userName}`,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (err: any) {
    res.status(500).json({
      msg: "There is some problem in login ...",
      error: err.message,
    });
  }
};

//! Verify the email sent to the email at the time of the register ...
export const adminMailVerification = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({
        status: 0,
        msg: "Invalid or missing verification id",
      });
    }

    // check the user ...
    const foundAdmin = await User.findOne({
      _id: id,
      role: "admin",
    });

    if (!foundAdmin) {
      throw new ApiError(
        "User Not Found , Please register first ...",
        404,
        true
      );
    }

    //if user is already verified ...
    if (foundAdmin.isVerified) {
      return res.send({
        message: "Your mail has been already verified ...",
      });
    }

    // user found then show verified and save ...
    foundAdmin.isVerified = true;
    await foundAdmin.save();
    return res.status(200).json({
      status: 1,
      message: "Mail has been verified successfully ....",
    });
  } catch (err: any) {
    return res.status(500).json({
      status: 0,
      msg: err.message,
    });
  }
};

//!   Approve Seller (Admin Only)
export const approveSeller = async (req: Request, res: Response) => {
  try {
    //* Admin-only check
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        status: 0,
        msg: "Admins only",
      });
    }

    const { sellerId } = req.params;

    if (!sellerId) {
      return res.status(400).json({
        status: 0,
        msg: "Seller ID is required",
      });
    }

    //* Find pending seller
    const seller = await User.findOne({
      _id: sellerId,
      role: "seller",
      status: "pending",
    });

    if (!seller) {
      return res.status(404).json({
        status: 0,
        msg: "Pending seller not found",
      });
    }

    //* Approve seller
    seller.status = "active";
    await seller.save();

    return res.status(200).json({
      status: 1,
      msg: "Seller approved successfully",
      sellerId: seller._id,
      sellerName: seller.ownerName,
    });
  } catch (err: any) {
    return res.status(500).json({
      status: 0,
      msg: err.message,
    });
  }
};

//!   To view all the data of any user
export const viewAll = async (req: Request, res: Response) => {
  try {
    //* ADMIN-ONLY CHECK
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        msg: "Admins only",
      });
    }
    const role = req.query.role as string | undefined;
    const status = req.query.status as string | undefined;

    let data;
    const food = await Food.find();

    if (role === "user") {
      data = await User.find({ role: "user" }).select("-password");
    } else if (role === "seller") {
      const query: any = { role: "seller" };

      //* hide soft-deleted sellers by default
      if (status) {
        query.status = status;
      } else {
        query.status = { $ne: "isDeleted" };
      }

      data = await User.find(query).select("-password");
    } else if (role === "admin") {
      data = await User.find({ role: "admin" }).select("-password");
    } else {
      data = { user: await User.find().select("-password"), food: food };
    }

    return res.status(200).json({
      status: 1,
      msg: "Data fetched successfully",
      data,
    });
  } catch (err: any) {
    return res.status(500).json({
      status: 0,
      msg: err.message,
    });
  }
};


//!    ================= ADMIN RESTORE SELLER =================
export const restoreSellerByAdmin = async (req: Request, res: Response) => {
  try {
    //* Admin-only check
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        status: 0,
        msg: "Admins only",
      });
    }

    const { sellerId } = req.params;

    if (!sellerId) {
      return res.status(400).json({
        status: 0,
        msg: "Seller ID is required",
      });
    }

    const seller = await User.findOne({
      _id: sellerId,
      role: "seller",
      status: "isDeleted",
    });

    if (!seller) {
      return res.status(404).json({
        status: 0,
        msg: "Deleted seller not found",
      });
    }

    //* Restore seller safely (inactive by default)
    seller.status = "inActive";
    await seller.save();

    return res.status(200).json({
      status: 1,
      msg: "Seller restored successfully",
      sellerId: seller._id,
    });
  } catch (err: any) {
    return res.status(500).json({
      status: 0,
      msg: err.message,
    });
  }
};