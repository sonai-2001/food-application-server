import { userMailVerification } from './../../controllers/userController';
import { Router } from "express";
import { requestvalidator } from "../../helpers/validation";
import { userLogin, userRegister } from "../../controllers/userController";

const router = Router();

//!     USER LOGIN ROUTE ~
router.post("/login", userLogin);


// !    USER REGISTER ROUTE
router.post("/register", requestvalidator, userRegister);

//!     Sent the mail-verification at the time of the register ..
router.get("/mail-verification", userMailVerification);

export default router;