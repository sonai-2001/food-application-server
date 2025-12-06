import { Router } from "express";
import sellerAuth from "./seller.auth"
const router = Router();

router.use("/auth", sellerAuth);
export default router;
