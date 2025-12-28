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
  viewAll,
} from "../../controllers/adminController";
import user from "../../models/user";
import seller from "../../models/seller";
import food from "../../models/food";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

//!   Register API ~
router.post(
  "/register",
  adminValidator, // first protect
  ...requestvalidator, // spread the validator array
  adminRegister
);

//!   Login API ~
router.post("/login",requestvalidator ,adminLogin);

//! CLEAR ALL THE ENTRY API ~
router.delete("/delAll", async (req: any, res: any) => {
  const delResAdmin = await admin.deleteMany();
  const delResUser = await user.deleteMany();
  const delResSeller = await seller.deleteMany();
  const delResFood = await food.deleteMany();

  res.send({
    status: 1,
    msg: "All users has been deleted successfully ...",
    delResAdmin,
    delResUser,
    delResSeller,
    delResFood,
  });
});

//!   View All Entrys ...
router.get("/view",authMiddleware,viewAll);

//!   Mail-verificaion at the time of register ...
router.get("/mail-verification", adminMailVerification);

// resend the mail verification ...
router.get(
  "/send-mail-verification",
  sendMailVerificator,
  sendMailVerification
);

export default router;
