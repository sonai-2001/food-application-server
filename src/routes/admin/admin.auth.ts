import { sendMailVerificator } from "./../../helpers/validation";
import { Router } from "express";
import user from "../../models/user";
import {
  mailVerification,
  sendMailVerification,
  userLogin,
  userRegister,
} from "../../controllers/userController";
import { requestvalidator } from "../../helpers/validation";

const router = Router();
router.get("/login", userLogin);

router.get("/register", requestvalidator, userRegister);

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

router.get("/mail-verification", mailVerification);

// resend the mail verification ...
router.get(
  "/send-mail-verification",
  sendMailVerificator,
  sendMailVerification
);

export default router;
