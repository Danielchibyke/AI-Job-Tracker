
class ApplicationService{
    constructor(id,jobSeekerId,jobId,applicationDate,status){
        this.id = id;
        this.jobSeekerId = jobSeekerId;
        this.jobId = jobId;
        this.applicationDate = applicationDate;
        this.status = status
    }

    scheduleInterview(){}
    updateStatus(){}
}