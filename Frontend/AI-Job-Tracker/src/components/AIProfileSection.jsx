import React, { useEffect, useState } from "react";
import { userService } from "../services/api";
import SkeletonLoader from "./ui/SkeletonLoader";

// AIProfileSection: Fetches and displays the AI profile for the current user (dashboard version)
export default function AIProfileSection() {
  const [aiProfile, setAiProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch AI profile from backend
  const fetchAIProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await userService.getProfile();
      setAiProfile(profile.aiProfile || null);
    } catch (err) {
      setError("Failed to load AI Profile.");
    } finally {
      setLoading(false);
    }
  };

  // Refresh AI profile (calls backend refresh endpoint)
  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await userService.refreshAIProfile();
      await fetchAIProfile();
    } catch (err) {
      setError("Failed to refresh AI Profile.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAIProfile();
  }, []);

  if (loading) return <SkeletonLoader />;
  if (error) return <div className="error-message">{error}</div>;
  if (!aiProfile || Object.keys(aiProfile).length === 0) return <div>No AI Profile data available.</div>;

  // Render AI Profile details (rich UI, same as Profile page)
  return (
    <section className="bg-gradient-to-br from-blue-800 via-purple-800 to-blue-900 rounded-2xl p-8 mb-6 shadow-2xl border border-blue-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span role="img" aria-label="rocket">🚀</span> AI Career Roadmap & Insights
        </h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow hover:from-blue-700 hover:to-purple-700 transition"
        >
          {refreshing ? 'Refreshing...' : 'Refresh AI Profile'}
        </button>
      </div>
      {/* Skill Match Score with Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <strong className="text-white text-lg">Skill Match Score:</strong>
          <span className="ml-2 font-bold text-blue-300 text-xl">{aiProfile.skillMatchScore ?? 'N/A'}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${aiProfile.skillMatchScore || 0}%` }}
          ></div>
        </div>
      </div>
      {/* Recommended Skills */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" /></svg>
          <strong className="text-white text-lg">Recommended Skills to Learn:</strong>
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          {aiProfile.recommendedSkills && aiProfile.recommendedSkills.map((skill, idx) => (
            <span key={idx} className="bg-green-700/80 text-white px-4 py-1 rounded-full shadow text-sm font-semibold hover:bg-green-600/90 transition cursor-pointer" title="Add this skill to your learning plan">{skill}</span>
          ))}
        </div>
      </div>
      {/* Missing Skills (Skill Gap Analysis) */}
      {aiProfile.missingSkills && aiProfile.missingSkills.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" /></svg>
            <strong className="text-yellow-200 text-lg">Skill Gaps (Missing for Next Steps):</strong>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {aiProfile.missingSkills.map((skill, idx) => (
              <span key={idx} className="bg-yellow-700/80 text-white px-4 py-1 rounded-full shadow text-sm font-semibold hover:bg-yellow-600/90 transition cursor-help" title="This skill is recommended for your next career step">{skill}</span>
            ))}
          </div>
        </div>
      )}
      {/* Career Path Suggestions */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          <strong className="text-white text-lg">Career Path Suggestions:</strong>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {aiProfile.careerPath && aiProfile.careerPath.map((step, idx) => (
            <div key={idx} className="bg-white/10 border border-purple-700 rounded-xl p-4 shadow flex flex-col gap-2">
              <span className="font-semibold text-purple-200 text-lg">{step.role}</span>
              <span className="text-gray-200 text-sm">Est. <span className="font-bold text-purple-300">{step.estimatedTime}</span> months</span>
              <span className="text-gray-300 text-xs">Skills: {step.requiredSkills?.join(', ')}</span>
              {/* Expanded fields: Certifications, Side Projects, Networking Actions */}
              {step.certifications && step.certifications.length > 0 && (
                <div className="text-xs text-blue-200 mt-1"><strong>Certifications:</strong> {step.certifications.join(', ')}</div>
              )}
              {step.sideProjects && step.sideProjects.length > 0 && (
                <div className="text-xs text-green-200 mt-1"><strong>Side Projects:</strong> {step.sideProjects.join(', ')}</div>
              )}
              {step.networkingActions && step.networkingActions.length > 0 && (
                <div className="text-xs text-yellow-200 mt-1"><strong>Networking Actions:</strong> {step.networkingActions.join(', ')}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Learning Resources */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9" /></svg>
          <strong className="text-white text-lg">Learning Resources:</strong>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {aiProfile.learningResources && aiProfile.learningResources.map((res, idx) => (
            <div key={idx} className="bg-white/10 border border-blue-700 rounded-xl p-4 shadow flex flex-col gap-1">
              <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-blue-200 underline font-semibold text-lg hover:text-blue-400 transition">{res.title}</a>
              <span className="text-xs text-gray-300">[{res.type}]</span>
              <div className="text-gray-200 text-sm">{res.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 