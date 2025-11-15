import { Router } from "express";
import userAuth from "./user.auth";
const router = Router();

router.get("/auth", userAuth);
export default router;