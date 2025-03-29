import { Job } from "../models/jobs.model.js";

class JobSeekerService {
    applicationHistory;
    constructor(resume, coverLetter, id){
        this.id = id
        this.resume = resume; //pdf/doc/csv
        this.coverLetter = coverLetter; //txt/pdf
    };

    searchJob=async(title)=>{
        const fJob = await Job.findOne({title: 'backend'});
        console.log(fJob);
    };

    applyForJob(){
        
    };
    trackApplicationStatus(){};
    receiveRecommendation(){};
    optimizeResume(){};
    scheduleInterview(){};
    setReminder(){};
}


export default new JobSeekerService