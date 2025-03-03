import express from "express";
import userService from "../services/user.service.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/signup", userService.signUp);
router.post("/login", userService.login);
router.post("/logout", verifyToken, userService.logout);
router.get("/welcome", verifyToken, userService.welcome);
router.get("/feeds", verifyToken ,(req, res)=>{
    res.send('feeds')
})

export default router;
