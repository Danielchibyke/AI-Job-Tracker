import express from 'express';
const app = express();
import connectDB from './DB/connectDB.js';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.route.js';
import cookieParser from "cookie-parser";
import JobSeekerService from './services/job.seeker.service.js';


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
console.log(JobSeekerService.searchJob('backend'));

app.use('/api/auth', authRoutes);



app.listen(PORT, ()=>{
    connectDB()
   console.log(`server is up and running on port ${PORT}`);
});
