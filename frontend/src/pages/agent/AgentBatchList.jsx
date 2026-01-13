import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import StatusBubbleText from "../../components/common/StatusBubbleText";

const AgentBatchList = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const res = await api.get("/agents/task-batches");
        setBatches(res.data.data || []);
      } catch (err) {
        console.error("FAILED TO LOAD BATCHES", err);
      } finally {
        setLoading(false);
      }
    };

    loadBatches();
  }, []);

  if (loading) {
    return <div className="p-6">Loading campaigns…</div>;
  }

  if (!batches.length) {
    return (
      <div className="p-6 text-center text-gray-500">
        No active campaigns assigned
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h2 className="text-xl font-semibold">My Campaigns</h2>

      {batches.map((batch) => (
        <div
          key={batch._id}
          className="border rounded-xl p-4 bg-white cursor-pointer hover:border-blue-400"
          onClick={() => navigate(`/agent/batches/${batch._id}`)}
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold">{batch.name}</div>
              <div className="text-xs text-gray-500">
                Created {new Date(batch.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex gap-2">
              <StatusBubbleText
                size="sm"
                status="info"
                text={batch.status}
              />
              <StatusBubbleText
                size="sm"
                status="success"
                text={batch.priority}
              />
            </div>
          </div>

          <div className="mt-2 text-xs text-gray-600 flex gap-4">
            <span>Pending: {batch.progress?.pending || 0}</span>
            <span>In Progress: {batch.progress?.inProgress || 0}</span>
            <span>Completed: {batch.progress?.completed || 0}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AgentBatchList;
