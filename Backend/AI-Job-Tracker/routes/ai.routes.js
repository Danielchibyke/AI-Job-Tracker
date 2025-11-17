import express from "express";
import axios from "axios";
import { Job } from "../models/jobs.model.js";
import { Application } from "../models/application.model.js";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { scrapeSerpApiJobs } from '../services/job.scraper.js';

const router = express.Router();
router.use(express.json());

//Scrape job listings using SerAPI
router.get("/scrape", async (req, res) => {
  const query = req.query.q || "Software Engineering";
  try {
    const savedJobs = await scrapeSerpApiJobs(query);
    res.json({ jobs: savedJobs, message: `${savedJobs.length} new jobs added to the database` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Application tracking and statistics
router.post("/application-tracking", async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Get all applications for the user
    const applications = await Application.find({ userId })
      .populate('jobId')
      .sort({ appliedDate: -1 });

    // Defensive: filter out applications with missing job data
    const validApplications = applications.filter(app => app.jobId);

    // Calculate statistics
    const stats = {
      total: validApplications.length,
      byStatus: {
        pending: validApplications.filter(app => app.status === 'pending').length,
        interview: validApplications.filter(app => app.status === 'interview').length,
        rejected: validApplications.filter(app => app.status === 'rejected').length,
        accepted: validApplications.filter(app => app.status === 'accepted').length,
        withdrawn: validApplications.filter(app => app.status === 'withdrawn').length
      },
      successRate: validApplications.length > 0 
        ? (validApplications.filter(app => app.status === 'accepted').length / validApplications.length * 100).toFixed(1)
        : 0,
      averageResponseTime: calculateAverageResponseTime(validApplications),
      recentActivity: validApplications.slice(0, 5).map(app => ({
        jobTitle: app.jobId.title,
        company: app.jobId.company,
        status: app.status,
        date: app.lastUpdated
      }))
    };

    res.json({
      applications: validApplications,
      stats,
      message: "Application tracking data retrieved successfully"
    });
  } catch (error) {
    console.error("Error in application tracking:", error);
    res.status(500).json({ error: "Failed to retrieve application tracking data" });
  }
});

// Update application status
router.put("/application-tracking/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes, interviewDate } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Update status
    if (status) {
      application.status = status;
      application.lastUpdated = new Date();
    }

    // Add notes if provided
    if (notes) {
      application.notes.push({
        content: notes,
        date: new Date()
      });
    }

    // Add interview date if provided
    if (interviewDate) {
      application.interviewDates.push({
        date: new Date(interviewDate.date),
        type: interviewDate.type,
        status: 'scheduled'
      });
    }

    await application.save();

    res.json({
      application,
      message: "Application updated successfully"
    });
  } catch (error) {
    console.error("Error updating application:", error);
    res.status(500).json({ error: "Failed to update application" });
  }
});

// Helper function to calculate average response time
function calculateAverageResponseTime(applications) {
  const respondedApplications = applications.filter(app => 
    app.status !== 'pending' && app.status !== 'withdrawn'
  );

  if (respondedApplications.length === 0) return 0;

  const totalResponseTime = respondedApplications.reduce((total, app) => {
    const responseTime = app.lastUpdated - app.appliedDate;
    return total + responseTime;
  }, 0);

  return Math.round(totalResponseTime / respondedApplications.length / (1000 * 60 * 60 * 24)); // Convert to days
}

// AI-powered auto-apply to jobs (batch)
router.post('/auto-apply', async (req, res) => {
  try {
    const { userId, jobIds } = req.body;
    if (!userId || !Array.isArray(jobIds) || jobIds.length === 0) return res.status(400).json({ error: 'userId and jobIds[] are required' });

    // Fetch user profile and resume
    const user = await (await import('../models/user.model.js')).default.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const resumeText = user.profile?.resumeText || 'Resume not available.';

    // Use Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const GEMINI_MODEL = "gemini-2.0-flash";
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const results = [];
    for (const jobId of jobIds) {
      try {
        // Fetch job details
        const job = await Job.findById(jobId);
        if (!job) {
          results.push({ jobId, error: 'Job not found' });
          continue;
        }
        // Prepare prompt for Gemini
        const prompt = `Given the following user resume:\n${resumeText}\n\nAnd the following job description:\n${job.description}\n\n1. Refine the resume to better match the job.\n2. Generate a tailored cover letter for this job.\n\nReturn as JSON: { refinedResume: string, coverLetter: string }`;
        const aiResponse = await model.generateContent(prompt);
        let result = {};
        try {
          result = JSON.parse(aiResponse.response.text());
        } catch (e) {
          result = { refinedResume: '', coverLetter: aiResponse.response.text() };
        }
        results.push({ jobId, jobTitle: job.title, ...result });
      } catch (err) {
        results.push({ jobId, error: err.message });
      }
    }

    res.json({
      message: 'AI batch auto-apply completed',
      applications: results
    });
  } catch (error) {
    console.error('Error in batch auto-apply:', error);
    res.status(500).json({ error: 'Failed to batch auto-apply with AI' });
  }
});

// POST /api/ai/recommend-jobs - returns recommended jobs for a user
router.post('/recommend-jobs', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    // Import models and service
    const User = (await import('../models/user.model.js')).default;
    const aiService = (await import('../services/ai.service.js')).default;

    // Check user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get recommended jobs
    const recommendedJobs = await aiService.recommendJobs(userId);
    res.json({ recommendedJobs });
  } catch (error) {
    console.error('Error in recommend-jobs:', error);
    res.status(500).json({ error: 'Failed to recommend jobs' });
  }
});

export default router;
