import jwt from 'jsonwebtoken';
import express from "express";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());
app.use(express.json());

export const verifyToken = async (req, res, next)=>{
    const token =await req.cookies.token;
    if(!token){
        console.error('No token provided in request:', {
            cookies: req.cookies,
            headers: req.headers
          });
        return res.status(401).json({sucess: false, message:'access denied'});
    }
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded)=>{
            if(err) return res.status(403).json({sucess: false, message:'invalid token'});
            req.user = decoded;
            next()
            
        });
}