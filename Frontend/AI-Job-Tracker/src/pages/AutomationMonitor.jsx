import React, { useEffect, useState } from 'react';

const fetchLogs = async (filters = {}, page = 1, limit = 20) => {
  const params = new URLSearchParams({ ...filters, limit, page });
  const res = await fetch(`/api/automation/logs?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch logs');
  const data = await res.json();
  return data.logs;
};

const statusColors = {
  success: 'text-green-700 bg-green-100',
  error: 'text-red-700 bg-red-100',
};
const actionColors = {
  'recommend': 'bg-blue-100 text-blue-800',
  'auto-apply': 'bg-purple-100 text-purple-800',
  'automation-error': 'bg-red-100 text-red-800',
};

function DetailsCard({ action, details }) {
  if (!details) return <span className="text-gray-400">(empty)</span>;
  if (action === 'recommend') {
    const jobs = details.recommendations || [];
    return (
      <div className="space-y-1">
        <div className="font-semibold text-blue-700">{jobs.length} job(s) recommended</div>
        {jobs.length > 0 && (
          <div className="text-xs text-gray-700">Top: <span className="font-medium">{jobs[0].title || jobs[0]}</span></div>
        )}
      </div>
    );
  }
  if (action === 'auto-apply') {
    const apps = details.autoApplyResult?.applications || [];
    const errors = apps.filter(a => a.error).length;
    return (
      <div className="space-y-1">
        <div className="font-semibold text-purple-700">{apps.length} job(s) auto-applied</div>
        {errors > 0 && <div className="text-xs text-red-600">{errors} error(s) in applications</div>}
        {apps.length > 0 && (
          <div className="text-xs text-gray-700">Top: <span className="font-medium">{apps[0].jobTitle || apps[0].jobId}</span></div>
        )}
      </div>
    );
  }
  if (action === 'automation-error') {
    return <div className="text-xs text-red-700 font-semibold">{details.error}</div>;
  }
  // fallback
  return <span className="text-xs text-gray-500">No summary available</span>;
}

export default function AutomationMonitor() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const loadLogs = async (opts = {}) => {
    try {
      setLoading(true);
      setError(null);
      const logs = await fetchLogs(filters, opts.page || page, limit);
      setLogs(logs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLogs();
    const interval = setInterval(() => {
      setRefreshing(true);
      loadLogs();
    }, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [filters, page]);

  const handleFilterChange = (e) => {
    setPage(1);
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleManualRefresh = () => {
    setRefreshing(true);
    loadLogs();
  };

  const toggleExpand = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  // Advanced search filter (client-side)
  const filteredLogs = logs.filter(log => {
    // Action filter
    if (filters.action && log.action !== filters.action) return false;
    // Status filter
    if (filters.status && log.status !== filters.status) return false;
    // Search filter
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    // Search userId
    if (log.userId && String(log.userId).toLowerCase().includes(q)) return true;
    // Search job title in recommendations or auto-apply
    if (log.action === 'recommend' && log.details?.recommendations) {
      if (log.details.recommendations.some(j => (j.title || j).toLowerCase().includes(q))) return true;
    }
    if (log.action === 'auto-apply' && log.details?.autoApplyResult?.applications) {
      if (log.details.autoApplyResult.applications.some(a => (a.jobTitle || a.jobId || '').toLowerCase().includes(q))) return true;
    }
    // Search error message
    if (log.action === 'automation-error' && log.details?.error && log.details.error.toLowerCase().includes(q)) return true;
    return false;
  });

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Automation Activity Monitor</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <input
            type="text"
            placeholder="Search by user, job, or error..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:ring-blue-400 w-56"
          />
          <select name="action" onChange={handleFilterChange} className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:ring-blue-400">
            <option value="">All Actions</option>
            <option value="recommend">Recommend</option>
            <option value="auto-apply">Auto-Apply</option>
            <option value="automation-error">Error</option>
          </select>
          <select name="status" onChange={handleFilterChange} className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:ring-blue-400">
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
          </select>
          <button
            onClick={handleManualRefresh}
            className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 flex items-center gap-2 shadow-sm text-sm font-medium"
            disabled={refreshing}
          >
            {refreshing ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /></svg>
            ) : null}
            Refresh
          </button>
          <span className="text-xs text-gray-500">Auto-refreshes every 10s</span>
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse h-16 bg-gray-200 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="text-red-500 font-medium">{error}</div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-gray-500 font-medium">No logs found.</div>
      ) : (
        <div>
          {/* Responsive: Table on md+, cards on mobile */}
          <div className="hidden md:block">
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="min-w-full bg-white rounded-lg">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map(log => (
                    <tr key={log._id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-3 text-xs text-gray-700 whitespace-nowrap font-medium">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-3 text-xs text-gray-700 break-all font-medium">{log.userId}</td>
                      <td className={`px-6 py-3 text-xs font-bold rounded ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}>{log.action}</td>
                      <td className={`px-6 py-3 text-xs font-bold rounded ${statusColors[log.status] || 'bg-gray-100 text-gray-700'}`}>{log.status}</td>
                      <td className="px-6 py-3 text-xs max-w-xs">
                        <div className="bg-gray-50 border border-gray-200 rounded p-2 font-sans text-xs relative space-y-1">
                          <DetailsCard action={log.action} details={log.details} />
                          <button
                            className="absolute top-1 right-2 text-blue-500 text-xs underline focus:outline-none"
                            onClick={() => toggleExpand(log._id)}
                          >
                            {expanded[log._id] ? 'Hide' : 'Show'} details
                          </button>
                          {expanded[log._id] && (
                            <div className="mt-2 text-xs text-gray-600">
                              <DetailsCard action={log.action} details={log.details} />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Card layout for mobile */}
          <div className="md:hidden flex flex-col gap-4">
            {filteredLogs.map(log => (
              <div key={log._id} className="bg-white rounded-lg shadow p-4 flex flex-col gap-2 border border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500 font-medium">{new Date(log.createdAt).toLocaleString()}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${statusColors[log.status] || 'bg-gray-100 text-gray-700'}`}>{log.status}</span>
                </div>
                <div className="flex flex-wrap gap-2 items-center mb-1">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}>{log.action}</span>
                  <span className="text-xs text-gray-700 break-all font-medium">User: {log.userId}</span>
                </div>
                <div className="overflow-x-auto bg-gray-50 rounded p-2 border border-gray-100 relative space-y-1">
                  <DetailsCard action={log.action} details={log.details} />
                  <button
                    className="absolute top-1 right-2 text-blue-500 text-xs underline focus:outline-none"
                    onClick={() => toggleExpand(log._id)}
                  >
                    {expanded[log._id] ? 'Hide' : 'Show'} details
                  </button>
                  {expanded[log._id] && (
                    <div className="mt-2 text-xs text-gray-600">
                      <DetailsCard action={log.action} details={log.details} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Pagination (if needed) */}
          <div className="flex justify-center mt-6 gap-2">
            <button
              className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm font-medium"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >Prev</button>
            <span className="px-2 py-1 text-sm font-medium">Page {page}</span>
            <button
              className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm font-medium"
              onClick={() => setPage(p => p + 1)}
              disabled={filteredLogs.length < limit}
            >Next</button>
          </div>
        </div>
      )}
    </div>
  );
} 