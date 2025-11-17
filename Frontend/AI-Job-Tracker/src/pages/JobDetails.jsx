import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import dayjs from 'dayjs';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { jobService } from '../services/api';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchJob() {
      setLoading(true);
      try {
        const data = await jobService.getJobById(id);
        setJob(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <SkeletonLoader width="100%" height={300} />
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }
  if (!job) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 p-4 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl mt-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-700 mb-4 focus:outline-none"
        >
          <FaArrowLeft /> Back
        </button>
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
          {job.logo ? (
            <img src={job.logo} alt="logo" className="w-20 h-20 object-contain rounded" />
          ) : (
            <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-gray-400 font-bold text-3xl">
              {job.company?.[0] || '?'}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{job.title}</h1>
            <div className="flex flex-wrap gap-2 mb-2">
              {job.type && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                  {job.type}
                </span>
              )}
              <span className="text-gray-300 text-xs">
                Posted {dayjs(job.postedDate).fromNow()}
              </span>
            </div>
            <div className="text-white text-lg font-semibold">{job.company}</div>
            <div className="text-gray-300">📍 {job.location}</div>
          </div>
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Job Description</h2>
          <p className="text-gray-100 whitespace-pre-line">{job.description}</p>
        </div>
        {job.requirements && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Requirements</h2>
            <ul className="list-disc ml-6 text-gray-100">
              {Array.isArray(job.requirements)
                ? job.requirements.map((req, i) => <li key={i}>{req}</li>)
                : job.requirements.split('\n').map((req, i) => <li key={i}>{req}</li>)}
            </ul>
          </div>
        )}
        {job.skills && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, i) => (
                <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails; 