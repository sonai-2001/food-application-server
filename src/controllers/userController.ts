import { ApiError } from "../utils/ApiError";
import user from "../models/user";
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
  const userCredentials = {
    userName: userName,
    email: email,
    password: password,
  };
  const User = new user(userCredentials);
  await User.save();

  const sub = `${userName} , Thanks for registering to our website ...`;
  const msg = `<h1 style="text-align: center; color : aqua">Hello ${userName}</h1>
    <div style="text-align: center;">
        <p>Wellcome to our familly , hope u will like this as much we want u to do ...</p>
        <p>This is in the dev version , so obviously it will be much better in the future .. so be with us ❤️</p>
        <p style="opacity: .2;"> This mail is generated Only for testing purposes ... </p>
        <button style="background-color: cyan; border-radius: 12px; padding :3px; font-size: 16px ; padding-left: 5px; padding-right: 5px;">
            💕
        </button>
        
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
    if (userPass == password) {
      return res.status(200).json({
        msg: `Wellcome ${foundUser.userName}`,
      });
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
