

import jwt from 'jsonwebtoken';
import express from "express";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());
app.use(express.json());

export const verifyToken = async (req, res, next) => {
  let token;

  // 1. Check for token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. If not in header, check for token in cookies
  if (!token) {
    token = req.cookies.token;
  }

  // 3. If no token found in either location, deny access
  if (!token) {
    console.error('No token provided in request:', {
      cookies: req.cookies,
      headers: req.headers
    });
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  // 4. Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err.message);
      return res.status(403).json({ success: false, message: 'Invalid token.' });
    }
    req.user = decoded;
    next();
  });
};