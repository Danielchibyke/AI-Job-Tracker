import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/user.model.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { verifyToken } from '../utils/verifyToken.js';
import NotificationService from '../services/notification.service.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), 'uploads', 'resumes');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ([".pdf", ".doc", ".docx", ".txt"].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only .pdf, .doc, .docx, .txt files are allowed!"));
    }
  }
});

// Configure multer for avatar upload
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), 'uploads', 'avatars');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  }
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const GEMINI_MODEL = "gemini-2.0-flash";

// Complete onboarding
router.post('/onboarding', upload.single('resume'), async (req, res) => {
 
  try {
    const { fullname, email, preferences, skills } = req.body;
    // Defensive: Validate and parse JSON strings for preferences and skills
    let parsedPreferences, parsedSkills;
    try {
      parsedPreferences = JSON.parse(preferences);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid preferences format. Must be valid JSON.', error: e.message });
    }
    try {
      parsedSkills = JSON.parse(skills);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid skills format. Must be valid JSON.', error: e.message });
    }

    // Find the existing user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found for onboarding' });
    }

    // Update user fields
    user.fullname = fullname;
    user.profile = user.profile || {};
    user.profile.resume = req.file ? req.file.path : user.profile.resume;
    user.profile.skills = Array.isArray(parsedSkills) ? parsedSkills : [];
    user.preferences = parsedPreferences;

    // If resume is uploaded, analyze it with Gemini AI
    if (req.file || req.body.resumeText) {
      // Extract resume text
      let resumeText = '';
      if (req.file) {
        const ext = path.extname(req.file.originalname).toLowerCase();
        if (ext === '.pdf') {
          const data = await pdfParse(fs.readFileSync(req.file.path));
          resumeText = data.text;
        } else if (ext === '.docx' || ext === '.doc') {
          const data = await mammoth.extractRawText({ path: req.file.path });
          resumeText = data.value;
        } else if (ext === '.txt') {
          resumeText = fs.readFileSync(req.file.path, 'utf-8');
        }
      } else if (req.body.resumeText) {
        resumeText = req.body.resumeText;
      }
      let aiAnalysis = { skills: [], experience: [], recommendations: [] };
      try {
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
        // Prompt for resume analysis
        const analysisPrompt = `Analyze the following resume and extract:\n1. A list of key skills\n2. A summary of work experience (title, company, years)\n3. 3 personalized recommendations to improve the resume for job applications\nReturn as JSON: { skills: string[], experience: { title: string, company: string, years: string }[], recommendations: string[] }\nResume:\n${resumeText}`;
        const aiResponse = await model.generateContent(analysisPrompt);
        try {
          if(aiResponse.response.text()){
            aiAnalysis = JSON.parse(aiResponse.response.text());
            console.log(aiAnalysis)
          }else{
            aiAnalysis = {
              skills: [],
              experience: [],
              aiAnalysis : JSON.parse(aiResponse.response.text())
            }
          }
        } catch (e) {
          aiAnalysis.skills = (aiResponse.response.text().match(/Skills:([\s\S]*?)\n/) || [])[1]?.split(',').map(s => s.trim()) || [];
          aiAnalysis.recommendations = (aiResponse.response.text().match(/Recommendations:([\s\S]*)/) || [])[1]?.split('\n').map(s => s.trim()).filter(Boolean) || [];
        }
      } catch (aiError) {
        // Local fallback: extract keywords from resume text
        const skillMatches = resumeText.match(/\b(JavaScript|Python|React|Node\.js|Java|C\+\+|SQL|AWS|Docker|Kubernetes|TypeScript|HTML|CSS)\b/gi) || [];
        aiAnalysis.skills = Array.from(new Set(skillMatches.map(s => s.trim())));
        aiAnalysis.recommendations = [
          'Add more measurable achievements to your resume.',
          'Tailor your resume for each job application.',
          'Highlight your most relevant skills and experience.'
        ];
      }
      // Save resume text and aiAnalysis only
      user.resume = user.resume || {};
      user.resume.resumeText = resumeText;
      user.resume.aiAnalysis = aiAnalysis;
    }

    await user.save();

    // Create notification for onboarding completion
    await NotificationService.sendNotification(
      user._id,
      'Congratulations! You have completed onboarding. Start applying for jobs now.'
    );

    res.status(200).json({
      message: 'Onboarding completed successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({
      message: 'Failed to complete onboarding',
      error: error.message
    });
  }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    // TODO: Implement authentication middleware
  
    const userId = req.user.userid; // This will come from auth middleware
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return smartAutomationEnabled in the response
    const publicProfile = user.getPublicProfile();
    publicProfile.smartAutomationEnabled = user.smartAutomationEnabled;
    // Ensure aiProfile is always present
    publicProfile.aiProfile = user.aiProfile || {};
    res.json(publicProfile);

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userid; // Corrected: get userId from auth middleware
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.profile = user.profile || {};
    // Update allowed fields, including clearing if empty
    if ('fullname' in req.body) user.fullname = req.body.fullname;
    if ('profile.bio' in req.body) user.profile.bio = req.body['profile.bio'] || '';
    if ('profile.skills' in req.body) user.profile.skills = Array.isArray(req.body['profile.skills']) ? req.body['profile.skills'] : [];
    if ('profile.linkedin' in req.body) user.profile.linkedin = req.body['profile.linkedin'] || '';
    if ('profile.github' in req.body) user.profile.github = req.body['profile.github'] || '';
    // Update smartAutomationEnabled if present
    if (typeof req.body.smartAutomationEnabled === 'boolean') {
      user.smartAutomationEnabled = req.body.smartAutomationEnabled;
    }
    await user.save();
    // Return smartAutomationEnabled in the response
    const publicProfile = user.getPublicProfile();
    publicProfile.smartAutomationEnabled = user.smartAutomationEnabled;
    res.json({
      message: 'Profile updated successfully',
      user: publicProfile
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// POST /upload-cv: Upload and parse CV
router.post('/upload-cv', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file is required' });
    const ext = path.extname(req.file.originalname).toLowerCase();
    let text = '';
    if (ext === '.pdf') {
      const data = await pdfParse(fs.readFileSync(req.file.path));
      text = data.text;
    } else if (ext === '.docx' || ext === '.doc') {
      const data = await mammoth.extractRawText({ path: req.file.path });
      text = data.value;
    } else if (ext === '.txt') {
      text = fs.readFileSync(req.file.path, 'utf-8');
    }
    // If userId is provided, store extracted text in user profile
    if (req.body.userId) {
      const user = await User.findById(req.body.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      user.profile = user.profile || {};
      user.profile.resumeText = text;
      await user.save();
    }
    res.json({ message: 'CV uploaded and parsed successfully', resumeText: text });
  } catch (error) {
    console.error('Error uploading/parsing CV:', error);
    res.status(500).json({ error: 'Failed to upload/parse CV' });
  }
});

// Fetch all notifications for the authenticated user
router.get('/notifications', verifyToken, async (req, res) => {
  try {
    const notifications = await NotificationService.getUserNotifications(req.user.userid || req.user.id);
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
});

// Get unread notification count for the authenticated user
router.get('/notifications/unread/count', verifyToken, async (req, res) => {
  try {
    const count = await NotificationService.getUnreadCount(req.user.userid || req.user.id);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch unread notification count', error: error.message });
  }
});

// Mark a notification as read
router.post('/notifications/:id/read', verifyToken, async (req, res) => {
  try {
    const notification = await NotificationService.markAsRead(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
  }
});

// Upload profile picture
router.post('/profile/avatar', verifyToken, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const user = await User.findById(req.user.userid);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.profile = user.profile || {};
    // If avatar is a string (old format), remove it and mark as modified
    if (typeof user.profile.avatar === 'string') {
      user.profile.avatar = undefined;
      user.markModified('profile');
    }
    // Store avatar as Buffer in MongoDB
    const avatarBuffer = fs.readFileSync(req.file.path);
    user.profile.avatar = {
      data: avatarBuffer,
      contentType: req.file.mimetype
    };
    await user.save();
    // Remove file from filesystem
    fs.unlinkSync(req.file.path);
    res.json({ message: 'Profile picture updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload profile picture', details: error.message });
  }
});

// Serve profile avatar
router.get('/profile/avatar', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userid);
    if (!user || !user.profile) return res.status(404).json({ error: 'User not found' });
    // Backward compatibility: if avatar is a string, serve from filesystem
    if (typeof user.profile.avatar === 'string') {
      const avatarPath = path.join(process.cwd(), 'uploads', 'avatars', user.profile.avatar);
      if (fs.existsSync(avatarPath)) {
        return res.sendFile(avatarPath);
      } else {
        return res.status(404).json({ error: 'Avatar not found' });
      }
    }
    // New: avatar as Buffer
    if (user.profile.avatar && user.profile.avatar.data) {
      res.set('Content-Type', user.profile.avatar.contentType || 'image/jpeg');
      return res.send(user.profile.avatar.data);
    }
    return res.status(404).json({ error: 'Avatar not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch avatar', details: error.message });
  }
});

// Refresh AI Profile for the authenticated user
router.post('/profile/ai-profile/refresh', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userid;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate new AI profile using the service
    const aiService = (await import('../services/ai.service.js')).default;
    const aiProfile = await aiService.generateAiProfile(user);
    user.aiProfile = aiProfile;
    await user.save();

    res.json({ message: 'AI profile refreshed successfully', aiProfile });
  } catch (error) {
    console.error('AI profile refresh error:', error);
    res.status(500).json({ message: 'Failed to refresh AI profile', error: error.message });
  }
});

export default router; 