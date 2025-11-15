import { Router } from "express";

const router = Router();

router.get("/login",(req,res)=>{
    res.send("Hello from admin login")
});

router.get("/register",(req,res)=>{
    res.send("Hello from admin register")
})
export default router;