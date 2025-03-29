import express from 'express';
import { Job } from '../models/jobs.model.js';
import { Application } from '../models/application.model.js';

const router = express.Router();

//get all jobs

router.get('/', async ( req, res)=>{
    const jobs = await Job.find();
    res.json(jobs);
});

//Apply for a job
router.post('/apply/:jobId', async (req,res)=>{
    const { userId } = req.body;
    try{
        const application = new Application({userId, jobId: req.params.jobId});
        await application.save();
        res.json({message: 'Application submitted!'});
            }catch(error){
                res.status(400).json({message: error.message});
             }
});

export default router;