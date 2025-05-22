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
import cron from 'node-cron';
import axios from 'axios';
import { Job } from './models/jobs.model.js';
import automationLogRoutes from './routes/automationLog.routes.js';
import User from './models/user.model.js';
import aiService from './services/ai.service.js';
import AutomationLog from './models/automationLog.model.js';

// Load environment variables first
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const allowedOrigins = [
  'http://localhost:5173',        // Local dev
  'http://192.168.56.1:5173',    // LAN access
  ' http://172.20.10.3:5173', // Production
];
// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({

  origin: function (origin, callback) {
      // Allow requests with no origin (e.g., mobile apps, Postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"]
  })
);

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

// Modular job source scrapers
async function scrapeSerpApiJobs(query = ' web developer') {
  try {
    const response = await axios.get(
      `https://serpapi.com/search.json?engine=google_jobs&q=${query}&api_key=${process.env.SERPAPI_KEY}`
    );
    const jobs = response.data.jobs_results;
   
    const savedJobs = [];
    for (let job of jobs) {
      const existingJob = await Job.findOne({ _id: job._id });
      if (!existingJob) {
        const newJob = new Job({
          title: job.title,
          company: job.company_name,
          location: job.location,
          skills: job.detected_extensions ? job.detected_extensions.skills || [] : [],
          description: job.description
        });
       
        await newJob.save();
        savedJobs.push(newJob);
      }
    }
    console.log(`[SerpAPI] Scraped and saved ${savedJobs.length} new jobs.`);
    return savedJobs;
  } catch (error) {
    console.error('[SerpAPI] Error scraping jobs:', error.message);
    return [];
  }
}

// Add more sources here in the future
async function scrapeAllJobSources() {
  await scrapeSerpApiJobs();
  // await scrapeAnotherSource();
}

// Schedule scraping every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('[CRON] Starting scheduled job scraping...');
  await scrapeAllJobSources();
  console.log('[CRON] Job scraping completed.');
});

// Automation worker logic (runs every minute)
cron.schedule('* * * * *', async () => {
  console.log('[Automation] Scheduled run at', new Date().toISOString());
  try {
    const users = await User.find({ smartAutomationEnabled: true });
    console.log(`[Automation] Found ${users.length} users with automation enabled.`);
    for (const user of users) {
      try {
        console.log(`[Automation] Running automation for user: ${user.email}`);
        const recommendations = await aiService.recommendJobs(user._id);
        await AutomationLog.create({
          userId: user._id,
          action: 'recommend',
          details: { recommendations },
          status: 'success'
        });
        console.log(`[Automation] Recommendations for ${user.email}:`, recommendations);
        const autoApplyResult = await aiService.autoApply(user._id);
        await AutomationLog.create({
          userId: user._id,
          action: 'auto-apply',
          details: { autoApplyResult },
          status: 'success'
        });
        console.log(`[Automation] Auto-apply result for ${user.email}:`, autoApplyResult);
      } catch (err) {
        await AutomationLog.create({
          userId: user._id,
          action: 'automation-error',
          details: { error: err.message },
          status: 'error'
        });
        console.error(`[Automation] Error processing user ${user.email}:`, err);
      }
    }
  } catch (err) {
    console.error('[Automation] Error:', err);
  }
});

// Start server
app.listen(PORT, "0.0.0.0", async () => {
  try {
    await connectDB();
    console.log(`Server is running on port ${PORT}`);
    console.log('Environment check:');
    console.log('- GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
    console.log('- SERPAPI_KEY:', process.env.SERPAPI_KEY ? 'Present' : 'Missing');
    console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Present' : 'Missing');
  } catch (error) {
    console.error('Failed to start server:', error);
  }
});
