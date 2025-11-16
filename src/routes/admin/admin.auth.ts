import { Router } from "express";
import user from "../../models/user";
import { ApiError } from "../../utils/ApiError";

const router = Router();
router.get("/login", (req, res) => {
  res.send("Hello from admin login");
});

router.get("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError("Please enter both credentials", 400, true);
  }
  const userCredentials = {
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
export default router;
