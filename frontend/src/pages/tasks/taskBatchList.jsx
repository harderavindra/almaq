import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Button from "../../components/common/Button";

const TaskBatchList = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = async () => {
    setLoading(true);
    const res = await api.get("/taskBatches");
    setBatches(res.data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBatches();
  }, []);


  const handleStatusChange = async (id, status) => {
    await api.patch(`/taskBatches/${id}`, { status });
    fetchBatches();
  };

  if (loading) {
    return <div className="p-6">Loading batches...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">Task Batches
        <Button
          variant="primary"
          onClick={() => window.location.href = "/task/task-batches/create"}
          className="ml-4"
        >
         +
        </Button>
      </h2>

      {batches.length === 0 ? (
        <div className="text-gray-500">No task batches found.</div>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Status</th>
                <th className="p-3">Total Tasks</th>
                <th className="p-3">Created</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {batches.map(batch => (
                <tr key={batch._id} className="border-t">
                  <td className="p-3 font-medium">{batch.name}</td>

                  <td className="p-3">
                    <select
                      value={batch.status}
                      onChange={e =>
                        handleStatusChange(batch._id, e.target.value)
                      }
                      className="border px-2 py-1 text-sm"
                    >
                      <option value="draft">Draft</option>
                      <option value="queued">Queued</option>
                      <option value="running">Running</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                  </td>

                  <td className="p-3">{batch.totalTasks}</td>

                  <td className="p-3">
                    {new Date(batch.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-3 text-right flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={() =>
                        window.location.href = `/task/task-batches/${batch._id}`
                      }
                    >
                      View
                    </Button>

                 
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TaskBatchList;
