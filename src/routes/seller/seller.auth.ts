import { Router } from "express";
import { sellerRegisterValidator } from "../../helpers/validation";
import { sellerLogin, sellerMailVerification, sellerRegister } from "../../controllers/sellerController";

const router = Router();

//!     Register Route ~
router.get("/register", sellerRegisterValidator, sellerRegister);

//!     Sent the mail-verification at the time of the register ...
router.get("/mail-verification", sellerMailVerification);

//!     USER LOGIN ROUTE ~
router.get("/login", sellerLogin);

export default router;
