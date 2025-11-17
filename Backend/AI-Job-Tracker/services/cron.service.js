import cron from 'node-cron';
import axios from 'axios';
import { Job } from '../models/jobs.model.js';
import User from '../models/user.model.js';
import aiService from './ai.service.js';
import AutomationLog from '../models/automationLog.model.js';

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

export const startCronJobs = () => {
    console.log('[CRON] Cron jobs started.');
};