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
import user from "../../models/user";
import seller from "../../models/seller";
import food from "../../models/food";

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
  const delResAdmin = await admin.deleteMany();
  const delResUser = await user.deleteMany();
  const delResSeller = await seller.deleteMany();

  res.send({
    status: 1,
    msg: "All users has been deleted successfully ...",
    delResAdmin,
    delResUser,
    delResSeller,
  });
});

//!   View All Entrys ...
router.get("/view", async (req: any, res: any) => {
  const Admins = await admin.find();
  const Users = await user.find();
  const Seller = await seller.find();
  const Food = await food.find();
  res.send({ Admins, Users, Seller , Food});
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
