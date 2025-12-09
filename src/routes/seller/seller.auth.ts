import { Router } from "express";
import { foodValidator, sellerRegisterValidator } from "../../helpers/validation";
import { addFood, sellerLogin, sellerMailVerification, sellerRegister } from "../../controllers/sellerController";

const router = Router();

//!     Register Route ~
router.get("/register", sellerRegisterValidator, sellerRegister);

//!     Sent the mail-verification at the time of the register ...
router.get("/mail-verification", sellerMailVerification);

//!     USER LOGIN ROUTE ~
router.get("/login", sellerLogin);

//!     ADD FOOD ITEMS ~
router.post("/add-food", foodValidator,addFood);

export default router;
