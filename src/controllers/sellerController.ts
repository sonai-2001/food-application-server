import  bcrypt  from 'bcrypt';
import { validationResult } from "express-validator";
import sendMail from "../config/nodeMailer";
import { ApiError } from "../utils/ApiError";
import seller from '../models/seller';
import { Request, Response } from 'express';

export const sellerRegister = async (req: Request, res: Response) => {
  const errors: any = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((e: any) => e.msg)
      .join(", ");
    throw new ApiError(errorMessages, 400, true);
  }

  const { ownerName,resturentName, email, password } = req.body;
  if (!email || !password) {
    throw new ApiError("Please enter both credentials", 400, true);
  }
  const hashpass = await bcrypt.hash(password, 10);
  const userCredentials = {
    ownerName: ownerName,
    resturentName:resturentName,
    email: email,
    password: hashpass,
  };
  const Seller = new seller(userCredentials);
  await Seller.save();

  const sub = `${resturentName} , Thanks for registering to our website ...`;
  const msg = `<h1 style="text-align: center; color : aqua">Hello ${ownerName}</h1>
    <div style="text-align: center;">
        <p>Wellcome to our familly , hope u will like this as much we want u to do ...</p>
        <p>This is in the dev version , so obviously it will be much better in the future .. so be with us ❤️</p>
        <p style="opacity: .2;"> Please click the button to verify ur email ... </p>
        <a href="http://127.0.0.1:3000/api/seller/auth/mail-verification?id=${Seller?._id}">
            <button style="background-color: cyan; border-radius: 12px; padding :3px; font-size: 16px ; padding-left: 5px; padding-right: 5px;">
            Verify
        </button>
        </a>
    </div>`;
  sendMail(email, sub, msg);

  res.status(201).json({
    msg: "Seller has been registered successfully , please check ur mail to validate ur email and account ...",
  });
};

//!   Seller Login API ~
export const sellerLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError("Please enter both credentials", 400, true);
    }
    const foundSeller = await seller.findOne({ email: email });

    if (!foundSeller) {
      throw new ApiError("Please register first ...", 400, true);
    }

    //* if user found get the pass and match , then return response
    const userPass = foundSeller.password;

    //* Check the pass ~
    //using the hashed pass so compare it ...
    const isValid = await bcrypt.compare(password, userPass);
    if (isValid) {
      res.status(200).json({
        msg: `Wellcome ${foundSeller.resturentName}`,
      });

      //* send another email to verify the login using the emial link...
      const msg = `<h1 style="text-align: center; color : aqua">Hello ${foundSeller?.ownerName}</h1>
      <div style="text-align: center;">
        <p>This email is sent to verify ur login to ur account linked with this email ...</p>
        <p>This is in the dev version , so obviously it will be much better in the future .. so be with us ❤️</p>
        <p style="opacity: .2;"> This mail is generated one ...</p>
        <button style="background-color: cyan; border-radius: 12px; padding :3px; font-size: 16px ; padding-left: 5px; padding-right: 5px;">
            💕
        </button>
        
      </div>`;

      sendMail(email, "Verification Email", msg);
    } else {
      res.send({
        status: 0,
        msg: "Please check ur password ...",
      });
    }
  } catch (err: any) {
    res.status(500).json({
      msg: "There is some problem in login ...",
      error: err.message,
    });
  }
};


//! Verify the email sent to the email at the time of the register ...
export const sellerMailVerification = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    if (id == undefined || id == null) {
      throw new ApiError("Not found ...", 404, true);
    }

    // check the user ...
    const foundSeller = await seller.findOne({ _id: id });
    if (!foundSeller) {
      throw new ApiError(
        "Seller Not Found , Please register first ...",
        404,
        true
      );
    }

    //user is already verified ...
    if (foundSeller.isVerified) {
      return res.send({
        message: "Your mail has been already verified ...",
      });
    }

    // user found then show verified and save ...
    foundSeller.isVerified = true;
    await foundSeller.save();
    return res.send({
      message: "Mail has been verified successfully ....",
    });
  } catch (err: any) {
    console.log(err.message);
    throw new ApiError(err.message, 500, false);
  }
};