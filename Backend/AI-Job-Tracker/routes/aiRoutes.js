import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SerpApi } from 'serpapi';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Smart Job Recommendations
router.post('/smart-recommendation', async (req, res) => {
  try {
    const { userProfile, preferences } = req.body;
    
    // Get job listings from SerpAPI
    const search = new SerpApi(process.env.SERPAPI_KEY);
    const jobs = await search.search({
      q: `${userProfile.skills.join(' ')} jobs ${preferences.location}`,
      engine: 'google_jobs',
      location: preferences.location
    });

    // Use Gemini to analyze and rank jobs
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Analyze these job listings and rank them based on the user's profile:
    User Skills: ${userProfile.skills.join(', ')}
    Experience: ${userProfile.experience}
    Preferences: ${JSON.stringify(preferences)}
    
    Jobs: ${JSON.stringify(jobs.jobs_results)}
    
    Provide match scores and reasons for each recommendation in JSON format with this structure:
    {
      "recommendations": [
        {
          "title": "job title",
          "matchScore": number,
          "reason": "explanation"
        }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const recommendations = JSON.parse(response.text());
    res.json({ recommendations: recommendations.recommendations });
  } catch (error) {
    console.error('Error in smart recommendation:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// CV Optimization
router.post('/cv-optimization', async (req, res) => {
  try {
    const { cv, targetJob } = req.body;
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Analyze this CV and provide optimization suggestions for the target job:
    CV: ${JSON.stringify(cv)}
    Target Job: ${JSON.stringify(targetJob)}
    
    Provide specific suggestions for improvement and an overall score out of 100 in JSON format:
    {
      "suggestions": ["suggestion1", "suggestion2", ...],
      "score": number
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = JSON.parse(response.text());
    res.json(analysis);
  } catch (error) {
    console.error('Error in CV optimization:', error);
    res.status(500).json({ error: 'Failed to analyze CV' });
  }
});

// Automated Job Application
router.post('/automate-job-application', async (req, res) => {
  try {
    const { jobDetails, userProfile } = req.body;
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Generate a cover letter for this job application:
    Job Details: ${JSON.stringify(jobDetails)}
    User Profile: ${JSON.stringify(userProfile)}
    
    Format the response as a professional cover letter.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const coverLetter = response.text();
    
    res.json({
      message: 'Application prepared successfully',
      coverLetter
    });
  } catch (error) {
    console.error('Error in job application:', error);
    res.status(500).json({ error: 'Failed to process application' });
  }
});

// Application Tracking
router.post('/application-tracking', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Here you would typically query your database for the user's applications
    // For now, we'll return mock data
    const stats = {
      applied: 15,
      interviews: 5,
      offers: 2
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Error in application tracking:', error);
    res.status(500).json({ error: 'Failed to fetch application stats' });
  }
});

export default router; 