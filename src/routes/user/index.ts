import { Router } from "express";
import userAuth from "./user.auth";
const router = Router();

router.use("/auth", userAuth);
export default router;