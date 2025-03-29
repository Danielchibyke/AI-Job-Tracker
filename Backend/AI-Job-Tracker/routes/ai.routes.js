import express from "express";
import axios from "axios";
import { Job } from "../models/jobs.model.js";

const router = express.Router();

//Scrape job listings using SerAPI
router.get("/scrape", async (req, res) => {
  const query = req.query.q || "Software Engineering ";
  try {
    const response = await axios.get(
      `https://serpapi.com/search.json?engine=google_jobs&q=${query}&api_key=${process.env.SERP_API_KEY}`
    );
         const jobs = response.data.jobs_results;

    const savedJobs = [];
    for(let job of jobs){
        const existingJob = await Job.findOne({title: job.title, company: job.company_name});
        if(!existingJob){
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

    res.json({ jobs: savedJobs, message: `${savedJobs.length} new jobs added to the database`})
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//auto-apply to jobs
router.post("/auto-apply", async (req, res) => {
  //AI logic to apply based on resume parsing (mockup)
  res.json({ message: "AI is applying to relevant jobs...." });
});

export default router;
