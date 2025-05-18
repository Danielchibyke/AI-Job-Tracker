import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

// BatchAutoApplySection: Handles batch auto-apply logic and UI
export default function BatchAutoApplySection({
  selectedJobs = [],
  setSelectedJobs = () => {},
  userId = null,
  onAutoApply = null, // Optional callback after auto-apply
}) {
  const [isAutoApplying, setIsAutoApplying] = useState(false);
  const [autoApplyResults, setAutoApplyResults] = useState(null);

  // Handle batch auto-apply
  const handleBatchAutoApply = async () => {
    if (selectedJobs.length === 0) {
      toast.error('Please select at least one job to apply to');
      return;
    }
    setIsAutoApplying(true);
    try {
      const response = await axios.post('/api/ai/auto-apply', {
        userId,
        jobIds: selectedJobs
      });
      setAutoApplyResults(response.data);
      toast.success('Batch auto-apply completed successfully!');
      setSelectedJobs([]);
      if (onAutoApply) onAutoApply(response.data);
    } catch (error) {
      console.error('Error in batch auto-apply:', error);
      toast.error('Failed to auto-apply to selected jobs');
    } finally {
      setIsAutoApplying(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">🤖 Batch Auto-Apply</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {selectedJobs.length} job{selectedJobs.length !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={handleBatchAutoApply}
            disabled={isAutoApplying || selectedJobs.length === 0}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isAutoApplying || selectedJobs.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isAutoApplying ? 'Applying...' : 'Auto-Apply to Selected Jobs'}
          </button>
        </div>
      </div>
      {autoApplyResults && (
        <div className="mt-4 p-4 bg-green-50 rounded-md">
          <h3 className="text-lg font-medium text-green-800">Auto-Apply Results</h3>
          <p className="text-sm text-green-600">
            Successfully applied to {autoApplyResults.applications?.filter(app => !app.error).length || 0} jobs
          </p>
        </div>
      )}
    </div>
  );
} 