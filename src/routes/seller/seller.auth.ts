import { Router } from "express";
import { foodValidator, sellerRegisterValidator } from "../../helpers/validation";
import { addFood, sellerLogin, sellerMailVerification, sellerRegister, deleteSellerSelf } from "../../controllers/sellerController";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

//!     Register Route ~
router.post("/register", sellerRegisterValidator, sellerRegister);

//!     Sent the mail-verification at the time of the register ...
router.get("/mail-verification", sellerMailVerification);

//!     USER LOGIN ROUTE ~
router.post("/login", sellerLogin);

//!     ADD FOOD ITEMS ~
router.post("/add-food", authMiddleware, foodValidator, addFood);

//!     SELLER SELF SOFT DELETE ~
router.patch("/delete", authMiddleware, deleteSellerSelf);

export default router;
