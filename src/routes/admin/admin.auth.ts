import { Router } from "express";
import user from "../../models/user";
import { ApiError } from "../../utils/ApiError";

const router = Router();
router.get("/login", async (req, res) => {
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
});

router.get("/register", async (req, res) => {
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

  res.status(201).json({
    msg: "user has been registered successfully ...",
    data: userCredentials,
  });
});

//! CLEAR ALL THE ENTRY API ~
router.delete("/delAll", async (req, res) => {
  const delRes = await user.deleteMany();

  res.send({
    status: 1,
    msg: "All users has been deleted successfully ...",
    delRes,
  });
});

//!   View All Entrys ...
router.get("/view", async (req, res) => {
  const Users = await user.find();
  res.send({ Users });
});

export default router;
