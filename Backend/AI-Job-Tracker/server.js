import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from "cookie-parser";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';
import connectDB from './DB/connectDB.js';
import authRoutes from './routes/auth.route.js';
import JobSeekerService from './services/job.seeker.service.js';
import aiRoute from './routes/ai.routes.js';
import jobRoute from './routes/job.route.js';
import userRoutes from './routes/user.routes.js';
import { startCronJobs } from './services/cron.service.js';
import rateLimit from 'express-rate-limit';
import automationLogRoutes from './routes/automationLog.routes.js';


// Load environment variables first
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const allowedOrigins = [
  'http://localhost:5173',        // Local dev
 // Production
  'https://ai-job-tracker-siia.vercel.app',
  'https://ai-job-tracker-6ekq.onrender.com',
  'https://ai-job-tracker-uq0f.onrender.com'
];
// Middleware
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type", "X-Requested-With"],
    exposedHeaders: ["Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  })
);
//rate limiter
// app.use('/api/auth', rateLimit({ windowMs: 15*60*1000, max: 5,  keyGenerator: (req) => req.headers['x-forwarded-for'] || req.ip }));


// Trust proxy headers (important for Vercel)
app.set('trust proxy', true);
// Handle OPTIONS requests
app.options('*', cors());
// Serve static files from uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'resumes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoute);
app.use('/api/ai', aiRoute);
app.use('/api/users', userRoutes);
app.use('/api/automation', automationLogRoutes);
app.get('/api/test',(req, res)=>{
  res.status(200).json('server is up and running!')
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, "0.0.0.0", async () => {
  try {
    await connectDB();
    console.log(`Server is running on port ${PORT}`);
    startCronJobs();
    console.log('Environment check:');
    console.log('- GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
    console.log('- SERPAPI_KEY:', process.env.SERPAPI_KEY ? 'Present' : 'Missing');
    console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Present' : 'Missing');
  } catch (error) {
    console.error('Failed to start server:', error);
  }
});
