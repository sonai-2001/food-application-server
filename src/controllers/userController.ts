import { ApiError } from "../utils/ApiError";
import user from "../models/user";
import bcrypt from "bcrypt";
import sendMail from "../config/nodeMailer";
import { validationResult } from "express-validator";

export const userRegister = async (req: any, res: any) => {
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
  const User = new user(userCredentials);
  await User.save();

  const sub = `${userName} , Thanks for registering to our website ...`;
  const msg = `<h1 style="text-align: center; color : aqua">Hello ${userName}</h1>
    <div style="text-align: center;">
        <p>Wellcome to our familly , hope u will like this as much we want u to do ...</p>
        <p>This is in the dev version , so obviously it will be much better in the future .. so be with us ❤️</p>
        <p style="opacity: .2;"> Please click the button to verify ur email ... </p>
        <a href="http://127.0.0.1:3000/api/admin/auth/mail-verification?id=${User?._id}">
            <button style="background-color: cyan; border-radius: 12px; padding :3px; font-size: 16px ; padding-left: 5px; padding-right: 5px;">
            Verify
        </button>
        </a>
    </div>`;
  sendMail(email, sub, msg);

  res.status(201).json({
    msg: "user has been registered successfully ...",
  });
};

export const userLogin = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError("Please enter both credentials", 400, true);
    }
    const foundUser = await user.findOne({ email: email });

    if (!foundUser) {
      throw new ApiError("Please register first ...", 400, true);
    }

    //* if user found get the pass and match , then return response
    const userPass = foundUser.password;

    //* Check the pass ~
    //using the hashed pass so compare it ...
    const isValid = await bcrypt.compare(password, userPass);
    if (isValid) {
      res.status(200).json({
        msg: `Wellcome ${foundUser.userName}`,
      });

      //* send another email to verify the login using the emial link...
      const msg = `<h1 style="text-align: center; color : aqua">Hello ${foundUser?.userName}</h1>
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
export const mailVerification = async (req: any, res: any) => {
  try {
    const { id } = req.query;
    if (id == undefined || id == null) {
      throw new ApiError("Not found ...", 404, true);
    }

    // check the user ...
    const foundUser = await user.findOne({ _id: id });
    if (!foundUser) {
      throw new ApiError(
        "User Not Found , Please register first ...",
        404,
        true
      );
    }

    //user is already verified ...
    if (foundUser.isVerified) {
      return res.send({
        message: "Your mail has been already verified ...",
      });
    }

    // user found then show verified and save ...
    foundUser.isVerified = true;
    await foundUser.save();
    return res.send({
      message: "Mail has been verified successfully ....",
    });
  } catch (err: any) {
    console.log(err.message);
    throw new ApiError(err.message, 500, false);
  }
};

//! Resend the mailVerification mail ~
export const sendMailVerification = async (req: any, res: any) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.send({
        status: 1,
        msg: "Please provide a valid email address ...",
        errors: errors.array(),
      });
    }

    const { email } = req.body;


    const foundUser = await user.findOne({ email });

    if (!foundUser) {
      return res.status(404).json({
        status: 0,
        msg: "Please register first ...",
      });
    }

    // if user is already verified ...
    if (foundUser.isVerified) {
      return res.send({
        status: 1,
        msg: `This email is already verified with userName ~ ${foundUser.userName}`,
      });
    }

    const msg = `<p> Hi ${foundUser.userName}, Please <a href="http://127.0.0.1:3000/api/admin/auth/mail-verification?id=${foundUser?._id}">Verify</a> your mail ...</p>`;

    sendMail(email, "Verification Mail", msg);

    res.send({
      status: 1,
      msg: "Please check ur email , the verification mail has been sent ...",
    });
  } catch (err: any) {
    throw new ApiError(err.message, 500, false);
  }
};
