import { Router } from "express";
import { requestvalidator } from "../../helpers/validation";
import { userLogin, userRegister } from "../../controllers/userController";

const router = Router();

//!     USER LOGIN ROUTE ~
router.get("/login", userLogin);

// !    USER REGISTER ROUTE
router.get("/register", requestvalidator, userRegister);

export default router;