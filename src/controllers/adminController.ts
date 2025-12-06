import  bcrypt  from 'bcrypt';
import sendMail from "../config/nodeMailer";
import { ApiError } from "../utils/ApiError";
import { validationResult } from 'express-validator';
import admin from '../models/admin';


//!     REGISTER API ~
export const adminRegister = async (req: any, res: any) => {
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
  if (!email || !password) {
    throw new ApiError("Please enter both credentials", 400, true);
  }
  const hashpass = await bcrypt.hash(password, 10);
  const userCredentials = {
    userName: userName,
    email: email,
    password: hashpass,
  };
  const Admin = new admin(userCredentials);
  await Admin.save();

  const sub = `${userName} , Admin wellcome to our website ...`;
  const msg = `<h1 style="text-align: center; color : aqua">Hello ${userName}</h1>
    <div style="text-align: center;">
        <p>Wellcome to our familly , hope u will like this as much we want u to do ...</p>
        <p>This is in the dev version , so obviously it will be much better in the future .. so be with us ❤️</p>
        <p style="opacity: .2;"> Please click the button to verify ur email ... </p>
        <a href="http://127.0.0.1:3000/api/admin/auth/mail-verification?id=${Admin?._id}">
            <button style="background-color: cyan; border-radius: 12px; padding :3px; font-size: 16px ; padding-left: 5px; padding-right: 5px;">
            Verify
        </button>
        </a>
    </div>`;
  sendMail(email, sub, msg);

  res.status(201).json({
    msg: "Admin has been registered successfully ...",
  });
};

//! Verify the email sent to the email at the time of the register ...
export const adminMailVerification = async (req: any, res: any) => {
  try {
    const { id } = req.query;
    if (id == undefined || id == null) {
      throw new ApiError("Not found ...", 404, true);
    }

    // check the user ...
    const foundAdmin = await admin.findOne({ _id: id });
    if (!foundAdmin) {
      throw new ApiError(
        "User Not Found , Please register first ...",
        404,
        true
      );
    }

    //user is already verified ...
    if (foundAdmin.isVerified) {
      return res.send({
        message: "Your mail has been already verified ...",
      });
    }

    // user found then show verified and save ...
    foundAdmin.isVerified = true;
    await foundAdmin.save();
    return res.send({
      message: "Mail has been verified successfully ....",
    });
  } catch (err: any) {
    console.log(err.message);
    throw new ApiError(err.message, 500, false);
  }
};
