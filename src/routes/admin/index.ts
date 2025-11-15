import { Router } from "express";
import adminAuth from "./admin.auth";

const router = Router();

router.get("/auth", adminAuth);
export default router;