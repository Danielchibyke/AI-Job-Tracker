import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ applied: 0, pending: 0, rejected: 0, offers: 0 });

  useEffect(() => {
    async function fetchJobs() {
      const { data } = await axios.get("/api/jobs");
      setJobs(data);
      setStats({
        applied: data.filter(job => job.status === "Applied").length,
        pending: data.filter(job => job.status === "Pending").length,
        rejected: data.filter(job => job.status === "Rejected").length,
        offers: data.filter(job => job.status === "Offer").length,
      });
    }
    fetchJobs();
  }, []);

  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold">AI Job Tracker Dashboard</h1>

      {/* Job Stats */}
      <div className="flex gap-4 my-4">
        <div className="p-4 bg-blue-500 text-white rounded">✅ Applied: {stats.applied}</div>
        <div className="p-4 bg-yellow-500 text-white rounded">🕒 Pending: {stats.pending}</div>
        <div className="p-4 bg-red-500 text-white rounded">❌ Rejected: {stats.rejected}</div>
        <div className="p-4 bg-green-500 text-white rounded">🎉 Offers: {stats.offers}</div>
      </div>

      {/* Job Listings */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">📄 Job Listings</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Title</th>
              <th className="border p-2">Company</th>
              <th className="border p-2">Location</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border">
                <td className="p-2">{job.title}</td>
                <td className="p-2">{job.company}</td>
                <td className="p-2">{job.location}</td>
                <td className="p-2">{job.status}</td>
                <td className="p-2">
                  {job.status === "Open" && <button className="bg-green-500 text-white px-2 py-1 rounded">Apply</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Resume Generator & Auto-Mail */}
      <div className="bg-white p-4 mt-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">📬 AI Auto-Mail</h2>
        <input type="text" placeholder="Recruiter's Email" className="border p-2 w-full mb-2" />
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Send Cover Letter</button>
      </div>

      {/* Job Status Chart */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">📊 Job Applications Overview</h2>
        <BarChart width={600} height={300} data={[
          { name: "Applied", value: stats.applied },
          { name: "Pending", value: stats.pending },
          { name: "Rejected", value: stats.rejected },
          { name: "Offers", value: stats.offers },
        ]}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </div>
    </div>
  );
}








