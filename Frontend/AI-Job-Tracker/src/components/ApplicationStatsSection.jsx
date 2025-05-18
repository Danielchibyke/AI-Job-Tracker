import React, { useEffect, useState, useContext } from "react";
import { applicationService } from "../services/api";
import { AuthContext } from "../context/AuthProvider";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

// ApplicationStatsSection: Shows application stats and recent activity
export default function ApplicationStatsSection() {
  const { user } = useContext(AuthContext);
  const [applicationStats, setApplicationStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        if (!user || !user._id) return;
        const { stats: appStats } = await applicationService.getApplicationTracking(user._id);
        setApplicationStats(appStats);
        setRecentActivity(appStats.recentActivity || []);
      } catch (err) {
        setError("Failed to load application stats.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [user]);

  if (loading) return <div className="text-center py-8">Loading application stats...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
  if (!applicationStats) return null;

  return (
    <>
      {/* Application Stats */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-2xl font-semibold mb-4">📊 Application Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-100 rounded-lg">
            <div className="text-lg font-semibold">Success Rate</div>
            <div className="text-3xl font-bold text-blue-600">{applicationStats.successRate}%</div>
          </div>
          <div className="p-4 bg-green-100 rounded-lg">
            <div className="text-lg font-semibold">Total Applications</div>
            <div className="text-3xl font-bold text-green-600">{applicationStats.total}</div>
          </div>
          <div className="p-4 bg-purple-100 rounded-lg">
            <div className="text-lg font-semibold">Avg. Response Time</div>
            <div className="text-3xl font-bold text-purple-600">{applicationStats.averageResponseTime} days</div>
          </div>
        </div>
        {/* Application Status Chart */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Application Status Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Pending', value: applicationStats.byStatus.pending, fill: '#FCD34D' },
                  { name: 'Interview', value: applicationStats.byStatus.interview, fill: '#60A5FA' },
                  { name: 'Rejected', value: applicationStats.byStatus.rejected, fill: '#EF4444' },
                  { name: 'Accepted', value: applicationStats.byStatus.accepted, fill: '#10B981' },
                  { name: 'Withdrawn', value: applicationStats.byStatus.withdrawn, fill: '#9CA3AF' }
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-2xl font-semibold mb-4">🕒 Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-semibold">{activity.jobTitle}</div>
                  <div className="text-sm text-gray-600">{activity.company}</div>
                </div>
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    activity.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    activity.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    activity.status === 'interview' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {activity.status}
                  </span>
                  <span className="ml-4 text-sm text-gray-500">
                    {new Date(activity.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
} 