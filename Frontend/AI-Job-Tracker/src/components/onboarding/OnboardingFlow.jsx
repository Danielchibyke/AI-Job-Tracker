import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { userService } from '../../services/api';
import Input from '../ui/Input';
import Button from '../ui/Button';

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to AI Job Tracker',
    description: 'Your AI-powered job search companion',
    component: WelcomeStep
  },
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Tell us about yourself',
    component: BasicInfoStep
  },
  {
    id: 'resume',
    title: 'Resume Upload',
    description: 'Upload your resume for AI analysis',
    component: ResumeStep
  },
  {
    id: 'preferences',
    title: 'Job Preferences',
    description: 'Help us find the perfect jobs for you',
    component: PreferencesStep
  },
  {
    id: 'skills',
    title: 'Skills Assessment',
    description: 'Let AI analyze your skills',
    component: SkillsStep
  }
];

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = async (stepData) => {
    // Always keep the latest resume file in formData
    setFormData(prev => {
      // If stepData contains resume, update it; otherwise, keep previous
      const updated = { ...prev, ...stepData };
      if (!stepData.resume && prev.resume) {
        updated.resume = prev.resume;
      }
      return updated;
    });

    if (currentStep === steps.length - 1) {
      // Use the latest formData (with resume file if present)
      const finalData = { ...formData, ...stepData };
      try {
        setLoading(true);
        // Debug: log the data being sent to the backend
        console.log('Submitting onboarding data:', finalData);
        await userService.completeOnboarding(finalData);
        navigate('/dashboard');
      } catch (error) {
        console.error('Error completing onboarding:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl"
        >
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`w-3 h-3 rounded-full ${
                    index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="h-1 bg-gray-200 rounded-full">
              <motion.div
                className="h-full bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-white mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-300 mb-8">
              {steps[currentStep].description}
            </p>
            <CurrentStepComponent
              onNext={handleNext}
              formData={formData}
              loading={loading}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function WelcomeStep({ onNext }) {
  return (
    <div className="text-center">
      <div className="mb-8">
        <div className="w-24 h-24 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          AI-Powered Job Search
        </h3>
        <p className="text-gray-300">
          Let our AI help you find the perfect job match
        </p>
      </div>
      <button
        onClick={() => onNext({})}
        className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-colors"
      >
        Get Started
      </button>
    </div>
  );
}

function BasicInfoStep({ onNext, formData }) {
  const [data, setData] = useState({
    fullname: '',
    email: '',
    ...formData
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Full Name"
        type="text"
        value={data.fullname}
        onChange={(e) => setData({ ...data, fullname: e.target.value })}
        required
      />
      <Input
        label="Email"
        type="email"
        value={data.email}
        onChange={(e) => setData({ ...data, email: e.target.value })}
        required
      />
      <Button type="submit">Continue</Button>
    </form>
  );
}

function ResumeStep({ onNext, formData }) {
  const [resume, setResume] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setResume(file);
      setAnalyzing(true);
      setError('');
      // Upload to backend and get extracted text
      const form = new FormData();
      form.append('cv', file);
      form.append('userId', formData.userId || '');
      try {
        const res = await fetch('/api/users/upload-cv', {
          method: 'POST',
          body: form
        });
        const data = await res.json();
        if (res.ok) {
          setResumeText(data.resumeText);
          setEditedText(data.resumeText);
        } else {
          setError(data.error || 'Failed to parse CV');
        }
      } catch (err) {
        setError('Failed to upload/parse CV');
      } finally {
        setAnalyzing(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext({ resume, resumeText: editedText });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
          id="resume-upload"
        />
        <label htmlFor="resume-upload" className="cursor-pointer block">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-white mb-2">
            {resume ? resume.name : 'Upload your resume'}
          </p>
          <p className="text-gray-400 text-sm">
            PDF, DOC, DOCX, or TXT (max 5MB)
          </p>
        </label>
      </div>

      {analyzing && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-white mt-2">AI is analyzing your resume...</p>
        </div>
      )}

      {error && <div className="text-red-400 text-center">{error}</div>}

      {resumeText && !editMode && (
        <div className="bg-white/10 rounded-lg p-4 text-white">
          <div className="mb-2 font-semibold">Extracted Resume Text:</div>
          <pre className="whitespace-pre-wrap text-sm max-h-48 overflow-y-auto">{resumeText}</pre>
          <button type="button" className="mt-2 text-blue-300 underline" onClick={() => setEditMode(true)}>
            Edit Text
          </button>
        </div>
      )}

      {editMode && (
        <div className="bg-white/10 rounded-lg p-4 text-white">
          <div className="mb-2 font-semibold">Edit Resume Text:</div>
          <Input
            as="textarea"
            className="w-full h-40 p-2 rounded bg-white/20 text-white"
            value={editedText}
            onChange={e => setEditedText(e.target.value)}
          />
          <Button type="button" className="mt-2 text-blue-300 underline" onClick={() => setEditMode(false)}>
            Save
          </Button>
        </div>
      )}

      <Button
        type="submit"
        disabled={!resumeText || analyzing}
        loading={analyzing}
      >
        Continue
      </Button>
    </form>
  );
}

function PreferencesStep({ onNext, formData }) {
  const [preferences, setPreferences] = useState({
    jobTypes: [],
    locations: [],
    salaryRange: { min: '', max: '' },
    industries: [],
    ...formData
  });

  const jobTypes = ['full-time', 'part-time', 'contract', 'internship', 'remote'];
  const industries = ['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext({ preferences });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-white mb-2">Job Types</label>
        <div className="flex flex-wrap gap-2">
          {jobTypes.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => {
                const newTypes = preferences.jobTypes.includes(type)
                  ? preferences.jobTypes.filter(t => t !== type)
                  : [...preferences.jobTypes, type];
                setPreferences({ ...preferences, jobTypes: newTypes });
              }}
              className={`px-4 py-2 rounded-full ${
                preferences.jobTypes.includes(type)
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-white mb-2">Salary Range</label>
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            placeholder="Min"
            value={preferences.salaryRange.min}
            onChange={(e) => setPreferences({
              ...preferences,
              salaryRange: { ...preferences.salaryRange, min: e.target.value }
            })}
          />
          <Input
            type="number"
            placeholder="Max"
            value={preferences.salaryRange.max}
            onChange={(e) => setPreferences({
              ...preferences,
              salaryRange: { ...preferences.salaryRange, max: e.target.value }
            })}
          />
        </div>
      </div>

      <div>
        <label className="block text-white mb-2">Industries</label>
        <div className="flex flex-wrap gap-2">
          {industries.map(industry => (
            <button
              key={industry}
              type="button"
              onClick={() => {
                const newIndustries = preferences.industries.includes(industry)
                  ? preferences.industries.filter(i => i !== industry)
                  : [...preferences.industries, industry];
                setPreferences({ ...preferences, industries: newIndustries });
              }}
              className={`px-4 py-2 rounded-full ${
                preferences.industries.includes(industry)
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white'
              }`}
            >
              {industry}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit">Continue</Button>
    </form>
  );
}

function SkillsStep({ onNext, formData }) {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const handleAddSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setAnalyzing(false);
      onNext({ skills });
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-white mb-2">Add Your Skills</label>
        <div className="flex gap-2">
          <Input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="e.g., JavaScript, React, Node.js"
          />
          <Button
            type="button"
            onClick={handleAddSkill}
            className="w-auto px-4 py-2"
          >
            Add
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {skills.map(skill => (
          <div
            key={skill}
            className="px-4 py-2 bg-blue-500/20 text-white rounded-full flex items-center gap-2"
          >
            {skill}
            <button
              type="button"
              onClick={() => setSkills(skills.filter(s => s !== skill))}
              className="text-white/60 hover:text-white"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {analyzing && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-white mt-2">AI is analyzing your skills...</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={analyzing}
        loading={analyzing}
      >
        Complete Setup
      </Button>
    </form>
  );
} 