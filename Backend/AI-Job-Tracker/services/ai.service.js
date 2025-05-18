import { Job } from '../models/jobs.model.js';
import { Application } from '../models/application.model.js';
import User from '../models/user.model.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import NotificationService from './notification.service.js';

const GEMINI_MODEL = 'gemini-2.0-flash';

// In-memory cache for recommended jobs per user
const recommendJobsCache = {};
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

class AiService {
    async jobRecommendation(userId) {}
    async parseJobDescription(jobDescription) {}
    async analyzeResume(resumeText) {}
    async generateInterviewQuestion(jobId, userId) {}
    async matchJobSeeker(jobId, userId) {}
    async recommendJobs(userId) {
        // Check cache first
        const now = Date.now();
        if (
            recommendJobsCache[userId] &&
            recommendJobsCache[userId].expires > now
        ) {
            return recommendJobsCache[userId].data;
        }
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');
        const jobs = await Job.find({ status: 'active' });
        if (!jobs.length) return [];
        const userSkills = user.profile?.skills?.map(s => s.toLowerCase()) || [];
        const userPreferences = user.profile?.preferences?.industries?.map(i => i.toLowerCase()) || [];
        // Compose job list for AI prompt
        const jobList = jobs.map(job => `Title: ${job.title}, Company: ${job.company}, Location: ${job.location}, Skills: ${job.skills.join(', ')}, Description: ${job.description}`).join('\n');
        const prompt = `Given the following user profile:\nSkills: ${userSkills.join(', ')}\nPreferred Industries: ${userPreferences.join(', ')}\n\nAnd the following job listings:\n${jobList}\n\nRecommend the top 5 jobs that best match the user's profile. For each job, return a JSON object with: title, matchExplanation (a short sentence explaining why this job is a good match). Return as a JSON array.`;
        let recommendedJobs = [];
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
            const aiResponse = await model.generateContent(prompt);
            let aiResults = [];
            try {
                aiResults = JSON.parse(aiResponse.response.text());
            } catch (e) {
                // fallback: extract job titles and explanations from text
                aiResults = (aiResponse.response.text().match(/\{[^}]+\}/g) || []).map(str => {
                    try { return JSON.parse(str); } catch { return null; }
                }).filter(Boolean);
            }
            // Map AI results to actual jobs, attach explanation
            recommendedJobs = aiResults.map(aiJob => {
                const job = jobs.find(j => j.title === aiJob.title);
                if (job) {
                    return { ...job.toObject(), matchExplanation: aiJob.matchExplanation || '' };
                }
                return null;
            }).filter(Boolean);
        } catch (aiError) {
            // fallback: local recommendation with explanation
            const userSkillSet = new Set(userSkills);
            const userIndustries = new Set(userPreferences);
            const scoredJobs = jobs.map(job => {
                const jobSkills = (job.skills || []).map(s => s.toLowerCase());
                const jobIndustry = (job.industry || '').toLowerCase();
                const skillMatches = jobSkills.filter(s => userSkillSet.has(s)).length;
                const industryMatch = userIndustries.has(jobIndustry) ? 1 : 0;
                let explanation = `Matches ${skillMatches} of your skills`;
                if (industryMatch) explanation += ", and matches your preferred industry";
                return { job, score: skillMatches + industryMatch, matchExplanation: explanation };
            });
            scoredJobs.sort((a, b) => b.score - a.score);
            recommendedJobs = scoredJobs.filter(j => j.score > 0).slice(0, 5).map(j => ({ ...j.job.toObject(), matchExplanation: j.matchExplanation }));
            if (!recommendedJobs.length) recommendedJobs = jobs.slice(0, 5).map(j => ({ ...j.toObject(), matchExplanation: 'Top job in the list' }));
        }
        // Cache the result
        recommendJobsCache[userId] = {
            data: recommendedJobs,
            expires: now + CACHE_DURATION_MS
        };
        return recommendedJobs;
    }
    async autoApply(userId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');
        const resumeText = user.profile?.resumeText || 'Resume not available.';
        const recommendedJobs = await this.recommendJobs(userId);
        if (!recommendedJobs.length) return { message: 'No jobs to apply to', applications: [] };
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
        const results = [];
        for (const job of recommendedJobs) {
            try {
                // Check if already applied
                const existingApp = await Application.findOne({ userId, jobId: job._id });
                if (existingApp && existingApp.status !== 'withdrawn') {
                    results.push({ jobId: job._id, jobTitle: job.title, error: 'Already applied' });
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
                // Create application
                const application = new Application({
                    userId,
                    jobId: job._id,
                    status: 'pending',
                    coverLetter: result.coverLetter,
                    resume: result.refinedResume || resumeText
                });
                await application.save();
                // Optionally update job's appliedUsers
                if (!job.appliedUsers.includes(userId)) {
                    job.appliedUsers.push(userId);
                    await job.save();
                }
                // Notify user
                await NotificationService.sendNotification(
                    userId,
                    `Auto-applied to job: ${job.title} at ${job.company}`
                );
                results.push({ jobId: job._id, jobTitle: job.title, ...result });
            } catch (err) {
                results.push({ jobId: job._id, jobTitle: job.title, error: err.message });
            }
        }
        return { message: 'AI batch auto-apply completed', applications: results };
    }
    async optimizeCV(userId, targetJobId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');
        const job = await Job.findById(targetJobId);
        if (!job) throw new Error('Job not found');
        const cv = user.profile?.resumeText || '';
        const targetJob = {
            title: job.title,
            company: job.company,
            description: job.description,
            skills: job.skills
        };
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
        const prompt = `Analyze this CV and provide optimization suggestions for the target job:\nCV: ${JSON.stringify(cv)}\nTarget Job: ${JSON.stringify(targetJob)}\n\nProvide specific suggestions for improvement and an overall score out of 100 in JSON format:\n{\n  "suggestions": ["suggestion1", "suggestion2", ...],\n  "score": number\n}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let analysis = { suggestions: [], score: 0 };
        try {
            analysis = JSON.parse(response.text());
        } catch (e) {
            // fallback: try to extract suggestions and score from text
            analysis.suggestions = (response.text().match(/suggestions:([\s\S]*?)\n/) || [])[1]?.split('\n').map(s => s.trim()).filter(Boolean) || [];
            analysis.score = parseInt((response.text().match(/score:(\d+)/) || [])[1]) || 0;
        }
        return analysis;
    }
    // Generate an AI-powered profile for a user (does not save to DB)
    async generateAiProfile(user) {
        if (!user) throw new Error('User is required');
        const resumeText = user.resume?.resumeText || user.profile?.resumeText || '';
        const userSkills = user.profile?.skills || [];
        // Compose a prompt for Gemini
        const prompt = `Given the following user resume and profile, generate a JSON object with:\n1. skillMatchScore: a number from 0-100 representing how well this candidate matches a typical software engineering job.\n2. recommendedSkills: an array of 5 skills the candidate should learn next.\n3. missingSkills: an array of skills required for the next career steps but not present in the user's current skills.\n4. careerPath: an array of up to 3 objects, each with { role, requiredSkills, estimatedTime, certifications, sideProjects, networkingActions } for the next logical career steps.\n5. learningResources: an array of up to 3 resources, each with { title, type, url, description } to help the candidate upskill.\nReturn as JSON: { skillMatchScore: number, recommendedSkills: string[], missingSkills: string[], careerPath: { role: string, requiredSkills: string[], estimatedTime: number, certifications: string[], sideProjects: string[], networkingActions: string[] }[], learningResources: { title: string, type: string, url: string, description: string }[] }\nResume:\n${resumeText}\nCurrent Skills: ${userSkills.join(', ')}`;
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
            const aiResponse = await model.generateContent(prompt);
            let aiProfile = null;
            try {
                // Log the raw AI response for debugging
                console.log('Gemini AI raw response:', aiResponse.response.text());
                let raw = aiResponse.response.text().trim();
                // Remove triple backticks and optional 'json' language tag
                if (raw.startsWith('```')) {
                  raw = raw.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
                }
                aiProfile = JSON.parse(raw);
                // Log the parsed object
                console.log('Parsed aiProfile:', aiProfile);
                // --- Robust parsing for learningResources ---
                if (aiProfile && typeof aiProfile.learningResources === 'string') {
                    let lr = aiProfile.learningResources;
                    // Fix property names and single quotes to valid JSON
                    lr = lr.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":'); // property names
                    lr = lr.replace(/'/g, '"'); // single to double quotes
                    try {
                        aiProfile.learningResources = JSON.parse(lr);
                    } catch (e) {
                        console.error('Error parsing learningResources:', e, lr);
                        aiProfile.learningResources = [];
                    }
                }
                // If not an array, default to []
                if (!Array.isArray(aiProfile.learningResources)) {
                    aiProfile.learningResources = [];
                }
                // --- Robust parsing for missingSkills ---
                if (aiProfile && typeof aiProfile.missingSkills === 'string') {
                    try {
                        aiProfile.missingSkills = JSON.parse(aiProfile.missingSkills);
                    } catch (e) {
                        aiProfile.missingSkills = aiProfile.missingSkills.split(',').map(s => s.trim());
                    }
                }
                if (!Array.isArray(aiProfile.missingSkills)) {
                    aiProfile.missingSkills = [];
                }
                // --- Robust parsing for careerPath ---
                if (aiProfile && typeof aiProfile.careerPath === 'string') {
                    try {
                        aiProfile.careerPath = JSON.parse(aiProfile.careerPath);
                    } catch (e) {
                        aiProfile.careerPath = [];
                    }
                }
                if (!Array.isArray(aiProfile.careerPath)) {
                    aiProfile.careerPath = [];
                }
            } catch (e) {
                // Log the error and fallback
                console.error('Error parsing Gemini AI response, using fallback:', e);
                aiProfile = {
                    skillMatchScore: 60,
                    recommendedSkills: ['TypeScript', 'GraphQL', 'Cloud Computing', 'CI/CD', 'System Design'],
                    missingSkills: ['Machine Learning', 'DevOps'],
                    careerPath: [
                        { role: 'Senior Software Engineer', requiredSkills: ['System Design', 'Leadership'], estimatedTime: 24, certifications: ['AWS Certified Developer'], sideProjects: ['Open Source Contribution'], networkingActions: ['Attend Meetups'] },
                        { role: 'Tech Lead', requiredSkills: ['Project Management', 'Mentoring'], estimatedTime: 36, certifications: ['PMP'], sideProjects: ['Tech Blog'], networkingActions: ['Conference Speaking'] }
                    ],
                    learningResources: [
                        { title: 'System Design Primer', type: 'Book', url: 'https://github.com/donnemartin/system-design-primer', description: 'Comprehensive guide to system design.' },
                        { title: 'AWS Cloud Practitioner Essentials', type: 'Course', url: 'https://www.aws.training', description: 'Intro to cloud computing.' }
                    ]
                };
            }
            return aiProfile;
        } catch (aiError) {
            // Log the error and fallback
            console.error('Gemini AI API error, using fallback:', aiError);
            return {
                skillMatchScore: 50,
                recommendedSkills: ['TypeScript', 'GraphQL'],
                missingSkills: ['Machine Learning'],
                careerPath: [
                    { role: 'Senior Software Engineer', requiredSkills: ['System Design'], estimatedTime: 24, certifications: [], sideProjects: [], networkingActions: [] }
                ],
                learningResources: [
                    { title: 'System Design Primer', type: 'Book', url: 'https://github.com/donnemartin/system-design-primer', description: 'Comprehensive guide to system design.' }
                ]
            };
        }
    }
}

export default new AiService();