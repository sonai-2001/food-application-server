import { Router } from "express";
import adminAuth from "./admin.auth";

const router = Router();
router.use("/auth", adminAuth);
export default router;
