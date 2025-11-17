import express from 'express';
import { Job } from '../models/jobs.model.js';
import { Application } from '../models/application.model.js';
import { scrapeSerpApiJobs } from '../services/job.scraper.js';
import NotificationService from '../services/notification.service.js';

const router = express.Router();
router.use(express.json());

// Get all jobs with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const totalJobs = await Job.countDocuments({ status: 'active' });
    let jobs = await Job.find({ status: 'active' })
      .sort({ postedDate: -1 })
      .skip(skip)
      .limit(limit);
    
    // If no jobs, fetch new jobs from external source
    if (!jobs.length && page === 1) {
      await scrapeSerpApiJobs();
      jobs = await Job.find({ status: 'active' })
        .sort({ postedDate: -1 })
        .skip(skip)
        .limit(limit);
    }

    const hasMore = skip + jobs.length < totalJobs;

    res.json({ jobs, hasMore });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get a single job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// Apply for a job
router.post('/apply/:jobId', async (req, res) => {
  try {
    const { userId } = req.body;
    const jobId = req.params.jobId;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Find existing application
    let application = await Application.findOne({ userId, jobId });
    if (application) {
      if (application.status !== 'withdrawn') {
        return res.status(400).json({ error: 'Already applied for this job' });
      }
      // If withdrawn, reactivate
      application.status = 'pending';
      await application.save();
    } else {
      // Create new application
      application = new Application({
        userId,
        jobId,
        status: 'pending'
      });
      await application.save();
    }

    // Update job with new applicant if not already present
    if (!job.appliedUsers.includes(userId)) {
      job.appliedUsers.push(userId);
      await job.save();
    }

    // Create notification for the user
    await NotificationService.sendNotification(
      userId,
      `You have successfully applied for the job: ${job.title} at ${job.company}`
    );

    res.json({ message: 'Application submitted successfully!' });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Cancel (withdraw) application for a job
router.post('/cancel/:jobId', async (req, res) => {
  try {
    const { userId } = req.body;
    const jobId = req.params.jobId;

    // Find all applications for this user/job
    const applications = await Application.find({ userId, jobId });
    if (!applications.length) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Set status to withdrawn for all
    await Promise.all(applications.map(app => {
      app.status = 'withdrawn';
      return app.save();
    }));

    // Remove user from job's appliedUsers array
    const job = await Job.findById(jobId);
    if (job) {
      job.appliedUsers = job.appliedUsers.filter(id => id.toString() !== userId);
      await job.save();
    }

    // Create notification for the user
    if (job) {
      await NotificationService.sendNotification(
        userId,
        `You have withdrawn your application for the job: ${job.title} at ${job.company}`
      );
    }

    res.json({ message: 'Application cancelled successfully!' });
  } catch (error) {
    console.error('Error cancelling application:', error);
    res.status(500).json({ error: 'Failed to cancel application' });
  }
});

export default router;