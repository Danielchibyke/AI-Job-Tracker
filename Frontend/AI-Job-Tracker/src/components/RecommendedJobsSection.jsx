import React, { useEffect, useState, useContext } from "react";
import { userService } from "../services/api";
import { AuthContext } from "../context/AuthProvider";
import { FaRegBookmark, FaBookmark } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

// RecommendedJobsSection: Shows recommended jobs for the user
export default function RecommendedJobsSection({
  appliedJobIds = [],
  savedJobs = [],
  selectedJobs = [],
  onSaveJob = () => {},
  onApply = () => {},
  onCancel = () => {},
  onSelectJob = () => {},
}) {
  const { user } = useContext(AuthContext);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRecommended() {
      setLoading(true);
      setError(null);
      try {
        if (!user || !user._id) return;
        const rec = await userService.recommendJobs(user._id);
        setRecommendedJobs(rec.recommendedJobs || []);
      } catch (err) {
        setError("Failed to load recommended jobs.");
      } finally {
        setLoading(false);
      }
    }
    fetchRecommended();
  }, [user]);

  // JobCard subcomponent (reuse dashboard style)
  function JobCard({ job, isApplied, isSaved, onSave, onApply, onCancel, onSelect, selected, showCheckbox = false }) {
    const navigate = useNavigate();
    return (
      <div
        key={job._id}
        className="border rounded-lg p-4 hover:shadow-lg transition-shadow relative bg-white focus-within:ring-2 focus-within:ring-blue-400 cursor-pointer"
        tabIndex={0}
        onClick={e => {
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
            {new Date(job.postedDate).toLocaleDateString()}
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
    return <div className="text-center py-8">Loading recommended jobs...</div>;
  }
  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }
  if (!recommendedJobs.length) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-2xl font-semibold mb-4">🎯 Recommended Jobs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendedJobs.map((job) => {
          const isApplied = appliedJobIds.some(id => id && id.toString() === job._id.toString());
          const isSaved = savedJobs.includes(job._id);
          return (
            <JobCard
              key={job._id}
              job={job}
              isApplied={isApplied}
              isSaved={isSaved}
              onSave={onSaveJob}
              onApply={onApply}
              onCancel={onCancel}
              onSelect={onSelectJob}
              selected={selectedJobs.includes(job._id)}
              showCheckbox={false}
            />
          );
        })}
      </div>
    </div>
  );
} 