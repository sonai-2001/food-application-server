import { Router } from "express";

const router = Router();

router.get("/login",(req,res)=>{
    res.send("Hello from user login")
});

router.get("/register",(req,res)=>{
    res.send("Hello from user register")
})
export default router;