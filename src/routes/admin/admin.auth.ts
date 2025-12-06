import {
  adminValidator,
  requestvalidator,
  sendMailVerificator,
} from "./../../helpers/validation";
import { Router } from "express";
import admin from "../../models/admin";
import { sendMailVerification } from "../../controllers/userController";
import {
  adminLogin,
  adminMailVerification,
  adminRegister,
} from "../../controllers/adminController";

const router = Router();

//!   Register API ~
router.get(
  "/register",
  adminValidator, // first protect
  ...requestvalidator, // spread the validator array
  adminRegister
);

//!   Login API ~
router.get("/login", adminLogin);

//! CLEAR ALL THE ENTRY API ~
router.delete("/delAll", async (req: any, res: any) => {
  const delRes = await admin.deleteMany();

  res.send({
    status: 1,
    msg: "All users has been deleted successfully ...",
    delRes,
  });
});

//!   View All Entrys ...
router.get("/view", async (req: any, res: any) => {
  const Admins = await admin.find();
  res.send({ Admins });
});

//!   Mail-verificaion at the time of register ...
router.get("/mail-verification", adminMailVerification);

// resend the mail verification ...
router.get(
  "/send-mail-verification",
  sendMailVerificator,
  sendMailVerification
);

export default router;
