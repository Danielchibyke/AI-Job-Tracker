import React, { useState, useEffect, useContext } from "react";
import "./pagestyles.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthProvider";
import AiService from "../components/aiservices";
import { toast } from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { jobService, applicationService, userService } from "../services/api";
import { logout } from '../api/auth.api';
import InfiniteScroll from 'react-infinite-scroll-component';
import { FaRegBookmark, FaBookmark, FaArrowUp } from 'react-icons/fa';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import AIProfileSection from "../components/AIProfileSection";
import JobListSection from "../components/JobListSection";
import ApplicationStatsSection from "../components/ApplicationStatsSection";
import RecommendedJobsSection from "../components/RecommendedJobsSection";
import BatchAutoApplySection from "../components/BatchAutoApplySection";
dayjs.extend(relativeTime);

export const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ applied: 0, pending: 0, rejected: 0, offers: 0 });
  const [applicationStats, setApplicationStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [isAutoApplying, setIsAutoApplying] = useState(false);
  const [autoApplyResults, setAutoApplyResults] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const JOBS_PER_PAGE = 12;
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [aiProfile, setAiProfile] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch user profile for AI analysis
        if (user && user._id) {
          const profile = await userService.getProfile();
          setAiAnalysis(profile.profile?.aiAnalysis || null);
          setResumeText(profile.profile?.resumeText || '');
          setAiProfile(profile.aiProfile || null);
        }
        // Fetch first page of jobs
        const jobsData = await jobService.getAllJobs(1, JOBS_PER_PAGE);
        setJobs(jobsData.jobs || jobsData); // jobsData.jobs if paginated, else fallback
        setHasMore(jobsData.hasMore !== undefined ? jobsData.hasMore : (jobsData.length === JOBS_PER_PAGE));
        setPage(2);

        // Fetch application tracking data
        if (!user || !user._id) return;
        const userId = user._id;
        const { stats: appStats, applications } = await applicationService.getApplicationTracking(userId);
        setApplicationStats(appStats);
        setRecentActivity(appStats.recentActivity);

        // Track applied job IDs (handle both string and object jobId, filter out withdrawn)
        const ids = applications ? applications
          .filter(app => app.status !== 'withdrawn')
          .map(app => typeof app.jobId === 'string' ? app.jobId : app.jobId?._id)
        : [];
        setAppliedJobIds(ids);

        // Fetch recommended jobs
        const rec = await userService.recommendJobs(userId);
        setRecommendedJobs(rec.recommendedJobs || []);

        // Update job stats
        setStats({
          applied: appStats.byStatus.pending + appStats.byStatus.interview,
          pending: appStats.byStatus.pending,
          rejected: appStats.byStatus.rejected,
          offers: appStats.byStatus.accepted
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        // Check for unauthorized error (401/403)
        if (err && (err.status === 401 || err.status === 403 || err.message?.includes('401') || err.message?.includes('403'))) {
          navigate('/login');
        } else {
        setError("Failed to fetch data. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApply = async (jobId) => {
    try {
      if (!user || !user._id) return;
      const userId = user._id;
      // Optimistically update UI
      setAppliedJobIds(prev => [...prev, jobId]);
      setStats(prev => ({
        ...prev,
        applied: prev.applied + 1,
        pending: prev.pending + 1
      }));
      await jobService.applyForJob(jobId, userId);
    } catch (err) {
      // Revert on error
      setAppliedJobIds(prev => prev.filter(id => id !== jobId));
      setStats(prev => ({
        ...prev,
        applied: prev.applied - 1,
        pending: prev.pending - 1
      }));
      console.error("Error applying for job:", err);
      toast.error("Failed to apply for job. Please try again.");
    }
  };

  const handleCancel = async (jobId) => {
    try {
      if (!user || !user._id) return;
      const userId = user._id;
      // Optimistically update UI
      setAppliedJobIds(prev => prev.filter(id => id !== jobId));
      setStats(prev => ({
        ...prev,
        applied: prev.applied > 0 ? prev.applied - 1 : 0,
        pending: prev.pending > 0 ? prev.pending - 1 : 0
      }));
      await jobService.cancelApplication(jobId, userId);
    } catch (err) {
      // Revert on error
      setAppliedJobIds(prev => [...prev, jobId]);
      setStats(prev => ({
        ...prev,
        applied: prev.applied + 1,
        pending: prev.pending + 1
      }));
      console.error("Error cancelling application:", err);
      toast.error("Failed to cancel application. Please try again.");
    }
  };

  const handleJobSelect = (jobId) => {
    setSelectedJobs(prev => {
      if (prev.includes(jobId)) {
        return prev.filter(id => id !== jobId);
      }
      return [...prev, jobId];
    });
  };

  const handleBatchAutoApply = async () => {
    if (selectedJobs.length === 0) {
      toast.error('Please select at least one job to apply to');
      return;
    }

    setIsAutoApplying(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/auto-apply`, {
        userId: user._id,
        jobIds: selectedJobs
      });

      setAutoApplyResults(response.data);
      toast.success('Batch auto-apply completed successfully!');
      
      // Refresh data
      const { data: { stats: appStats, applications } } = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/application-tracking`, { userId: user._id });
      setApplicationStats(appStats);
      setRecentActivity(appStats.recentActivity);
      
      // Clear selected jobs
      setSelectedJobs([]);
    } catch (error) {
      console.error('Error in batch auto-apply:', error);
      toast.error('Failed to auto-apply to selected jobs');
    } finally {
      setIsAutoApplying(false);
    }
  };

  // Add a function to fetch more jobs
  const fetchMoreJobs = async () => {
    const jobsData = await jobService.getAllJobs(page, JOBS_PER_PAGE);
    setJobs(prev => [...prev, ...(jobsData.jobs || jobsData)]);
    setHasMore(jobsData.hasMore !== undefined ? jobsData.hasMore : (jobsData.length === JOBS_PER_PAGE));
    setPage(prev => prev + 1);
  };

  const handleSaveJob = (jobId) => {
    setSavedJobs(prev => prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]);
    // Optionally, persist to backend/localStorage here
  };

  // Get unique job types and locations from jobs
  const jobTypes = Array.from(new Set(jobs.map(j => j.type).filter(Boolean)));
  const locations = Array.from(new Set(jobs.map(j => j.location).filter(Boolean)));

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(search.toLowerCase()));
    const matchesType = selectedType ? job.type === selectedType : true;
    const matchesLocation = selectedLocation ? job.location === selectedLocation : true;
    return matchesSearch && matchesType && matchesLocation;
  });

  // JobCard component
  function JobCard({ job, isApplied, isSaved, onSave, onApply, onCancel, onSelect, selected, showCheckbox = true }) {
    const navigate = useNavigate();
    return (
      <div
        key={job._id}
        className="border rounded-lg p-4 hover:shadow-lg transition-shadow relative bg-white focus-within:ring-2 focus-within:ring-blue-400 cursor-pointer"
        tabIndex={0}
        onClick={e => {
          // Prevent click if clicking on a button or checkbox
          if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
          navigate(`/jobs/${job._id}`);
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') navigate(`/jobs/${job._id}`);
        }}
        aria-label={`View details for ${job.title}`}
      >
        {/* Company Logo */}
        {job.logo ? (
          <img src={job.logo} alt="logo" className="w-12 h-12 object-contain mb-2" />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-400 font-bold text-lg">
            {job.company?.[0] || '?'}
          </div>
        )}
        {/* Save Job Button */}
        <button
          className="absolute top-2 right-2 text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={e => { e.stopPropagation(); onSave(job._id); }}
          title={isSaved ? 'Unsave Job' : 'Save Job'}
          aria-label={isSaved ? 'Unsave job' : 'Save job'}
        >
          {isSaved ? <FaBookmark size={22} /> : <FaRegBookmark size={22} />}
        </button>
        {/* Job Type Badge */}
        {job.type && (
          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold mb-2 mr-2">
            {job.type}
          </span>
        )}
        {/* Posted Time */}
        {job.postedDate && (
          <span className="inline-block text-gray-400 text-xs mb-2">
            {dayjs(job.postedDate).fromNow()}
          </span>
        )}
        <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
        <p className="text-gray-600 mb-2">{job.company}</p>
        <p className="text-gray-500 mb-2">📍 {job.location}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {job.skills.map((skill, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              {skill}
            </span>
          ))}
        </div>
        <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-2 w-full">
          {showCheckbox && (
            <input
              type="checkbox"
              checked={selected}
              onChange={e => { e.stopPropagation(); onSelect(job._id); }}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded focus:outline-none"
              aria-label={selected ? `Deselect job ${job.title}` : `Select job ${job.title}`}
              onClick={e => e.stopPropagation()}
            />
          )}
          {isApplied ? (
            <>
              <button
                className="flex-1 bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed focus:outline-none w-full sm:w-auto"
                disabled
                aria-label="Already applied"
                onClick={e => e.stopPropagation()}
              >
                Applied
              </button>
              <button
                onClick={e => { e.stopPropagation(); onCancel(job._id); }}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 w-full sm:w-auto"
                aria-label={`Cancel application for ${job.title}`}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={e => { e.stopPropagation(); onApply(job._id); }}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto"
              aria-label={`Apply for ${job.title}`}
            >
              Apply
            </button>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-5 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 bg-gray-100 min-h-screen flex flex-col items-center justify-center">
        <div className="text-xl text-red-500 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      {/* --- AI Profile Section (modular, self-refreshing) --- */}
      <AIProfileSection />
      {/* --- Application Stats & Recent Activity Section (modular) --- */}
      <ApplicationStatsSection />
      {/* --- Recommended Jobs Section (modular) --- */}
      <RecommendedJobsSection
        appliedJobIds={appliedJobIds}
        savedJobs={savedJobs}
        selectedJobs={selectedJobs}
        onSaveJob={handleSaveJob}
        onApply={handleApply}
        onCancel={handleCancel}
        onSelectJob={handleJobSelect}
      />
      {/* --- Batch Auto-Apply Section (modular) --- */}
      <BatchAutoApplySection
        selectedJobs={selectedJobs}
        setSelectedJobs={setSelectedJobs}
        userId={user?._id}
      />
      {/* --- Job List Section (modular, self-refreshing) --- */}
      <JobListSection
        appliedJobIds={appliedJobIds}
        onApply={handleApply}
        onCancel={handleCancel}
        savedJobs={savedJobs}
        onSaveJob={handleSaveJob}
        selectedJobs={selectedJobs}
        onSelectJob={handleJobSelect}
        setSelectedJobs={setSelectedJobs}
      />
      {/* AI Resume Analysis */}
      {aiAnalysis && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-2xl font-semibold mb-4">🤖 AI Resume Analysis</h2>
          <div className="mb-4">
            <strong>Key Skills:</strong>
            <ul className="list-disc ml-6">
              {aiAnalysis.skills && aiAnalysis.skills.map((skill, idx) => (
                <li key={idx}>{skill}</li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <strong>Experience:</strong>
            <ul className="list-disc ml-6">
              {aiAnalysis.experience && aiAnalysis.experience.map((exp, idx) => (
                <li key={idx}>{exp.title} at {exp.company} ({exp.years})</li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <strong>Recommendations:</strong>
            <ul className="list-disc ml-6">
              {aiAnalysis.recommendations && aiAnalysis.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
          {resumeText && (
            <details>
              <summary className="cursor-pointer text-blue-600">Show Extracted Resume Text</summary>
              <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded mt-2 max-h-48 overflow-y-auto">{resumeText}</pre>
            </details>
          )}
        </div>
      )}

      {/* AI Services Section */}
      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="text-2xl font-semibold mb-4">🤖 AI Assistant</h2>
        <AiService />
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
        >
          <FaArrowUp size={20} />
        </button>
      )}
    </div>
  );
};

export default Dashboard;
