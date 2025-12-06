import {
  requestvalidator,
  sendMailVerificator,
} from "./../../helpers/validation";
import { Router } from "express";
import admin from "../../models/admin";
import { sendMailVerification } from "../../controllers/userController";
import {
  adminMailVerification,
  adminRegister,
} from "../../controllers/adminController";

const router = Router();

//!   Register API ~
router.get("/register", requestvalidator, adminRegister);

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
  const Users = await admin.find();
  res.send({ Users });
});

router.get("/mail-verification", adminMailVerification);

// resend the mail verification ...
router.get(
  "/send-mail-verification",
  sendMailVerificator,
  sendMailVerification
);

export default router;
