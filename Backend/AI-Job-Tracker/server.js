import express from 'express';
const app = express();
import connectDB from './DB/connectDB.js';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.route.js';
import cookieParser from "cookie-parser";
import JobSeekerService from './services/job.seeker.service.js';
import aiRoute from './routes/ai.routes.js';
import jobRoute from './routes/job.route.js';


app.use(
    cors({
      origin: " http://localhost:5173", // Your frontend URL
      credentials: true, // Allow cookies to be sent
      allowedHeaders: ["Authorization", "Content-Type"]

    })
  );
dotenv.config();
app.use(express.json());
app.use(cookieParser());
const PORT = process.env.PORT || 3000;


app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoute);
app.use('/api/ai', aiRoute)



app.listen(PORT, ()=>{
    connectDB()
   console.log(`server is up and running on port ${PORT}`);
});
