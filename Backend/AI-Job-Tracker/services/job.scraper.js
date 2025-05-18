import axios from "axios";
import { Job } from "../models/jobs.model.js";

export async function scrapeSerpApiJobs(query = "MERN fullstack developer") {
  try {
    const response = await axios.get(
      `https://serpapi.com/search.json?engine=google_jobs&q=${query}&api_key=${process.env.SERPAPI_KEY}`
    );
    const jobs = response.data.jobs_results;
    const savedJobs = [];
    for (let job of jobs) {
      const existingJob = await Job.findOne({ title: job.title, company: job.company_name });
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
    return savedJobs;
  } catch (error) {
    console.error("[SerpAPI] Error scraping jobs:", error.message);
    return [];
  }
} 