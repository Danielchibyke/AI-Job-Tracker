import React, { useState, useEffect } from "react";
import InfiniteScroll from 'react-infinite-scroll-component';
import { jobService } from "../services/api";
import { FaRegBookmark, FaBookmark } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import dayjs from 'dayjs';

// JobListSection: Handles job fetching, filtering, selection, and actions
function JobListSection({
  appliedJobIds = [],
  onApply = () => {},
  onCancel = () => {},
  savedJobs = [],
  onSaveJob = () => {},
  selectedJobs = [],
  onSelectJob = () => {},
  setSelectedJobs = () => {},
}) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const JOBS_PER_PAGE = 12;
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    fetchJobs(1, true);
    // eslint-disable-next-line
  }, []);

  // Fetch jobs (paginated)
  const fetchJobs = async (pageNum = 1, initial = false) => {
    setLoading(true);
    setError(null);
    try {
      const jobsData = await jobService.getAllJobs(pageNum, JOBS_PER_PAGE);
      if (initial) {
        setJobs(jobsData.jobs || jobsData);
      } else {
        setJobs(prev => [...prev, ...(jobsData.jobs || jobsData)]);
      }
      setHasMore(jobsData.hasMore !== undefined ? jobsData.hasMore : (jobsData.length === JOBS_PER_PAGE));
      setPage(pageNum + 1);
    } catch (err) {
      setError("Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch more jobs for infinite scroll
  const fetchMoreJobs = () => {
    fetchJobs(page, false);
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

  // JobCard subcomponent (preserves all styles)
  function JobCard({ job, isApplied, isSaved, onSave, onApply, onCancel, onSelect, selected, showCheckbox = true }) {
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
    return <div className="text-center py-8">Loading jobs...</div>;
  }
  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  return (
    <>
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center w-full">
        <input
          type="text"
          placeholder="Search jobs, companies, or skills..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400 w-full sm:w-1/3 min-w-[180px]"
          aria-label="Search jobs, companies, or skills"
        />
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          className="px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400 w-full sm:w-1/4 min-w-[120px]"
          aria-label="Filter by job type"
        >
          <option value="">All Types</option>
          {jobTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select
          value={selectedLocation}
          onChange={e => setSelectedLocation(e.target.value)}
          className="px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400 w-full sm:w-1/4 min-w-[120px]"
          aria-label="Filter by location"
        >
          <option value="">All Locations</option>
          {locations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>
      {/* Select All Checkbox */}
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={filteredJobs.length > 0 && filteredJobs.every(job => selectedJobs.includes(job._id))}
          onChange={e => {
            if (e.target.checked) {
              setSelectedJobs(prev => Array.from(new Set([...prev, ...filteredJobs.map(job => job._id)])));
            } else {
              setSelectedJobs(prev => prev.filter(id => !filteredJobs.some(job => job._id === id)));
            }
          }}
          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2 focus:outline-none"
          aria-label="Select all jobs on this page"
        />
        <span className="text-gray-700">Select All</span>
      </div>
      {/* Job Listings */}
      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="text-2xl font-semibold mb-4">Available Jobs</h2>
        <InfiniteScroll
          dataLength={filteredJobs.length}
          next={fetchMoreJobs}
          hasMore={hasMore}
          loader={<div className="text-center py-4">Loading more jobs...</div>}
          endMessage={<div className="text-center py-4 text-gray-400">No more jobs to show.</div>}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.map((job) => {
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
                  showCheckbox={true}
                />
              );
            })}
          </div>
        </InfiniteScroll>
      </div>
    </>
  );
}

export default JobListSection; 