import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Button from "../../components/common/Button";
import { FiCalendar, FiFileText, FiMaximize, FiPlus, FiTrash, FiX } from "react-icons/fi";
import StatusBubble from "../../components/common/StatusBubble";
import StatusBubbleText from "../../components/common/StatusBubbleText";
import IconButton from "../../components/common/IconButton";
import Avatar from "../../components/common/Avatar";

const TaskBatchList = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = async () => {
    setLoading(true);
    const res = await api.get("/taskBatches");
    setBatches(res.data.data || []);
    console.log(res.data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const statusMap = (status) => {
    const map = {
      hold: 'warning',
      queued: 'info',
      completed: 'success',
      failed: 'error',
    };
    return map[status] || 'default';
  }
  const handleStatusChange = async (id, status) => {
    await api.patch(`/taskBatches/${id}`, { status });
    fetchBatches();
  };

  if (loading) {
    return <div className="p-6">Loading batches...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6 flex justify-between">Task Batches
        <button
          variant="c"
          onClick={() => window.location.href = "/task/task-batches/create"}
          className=" w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full text-lg "
        >
          <FiPlus size={18} />
        </button>
      </h2>

      {batches.length === 0 ? (
        <div className="text-gray-500">No task batches found.</div>
      ) : (
        <div className="overflow-x-auto  rounded">
          <div className="w-full text-sm">


            <div className="flex flex-col gap-4">
              {batches.map(batch => (
                <div key={batch._id} className="flex justify-between bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow items-center">
                  <h2 className="px-4 text-lg font-medium max-w-sm">{batch.name} </h2>

                  <div className="p-3">
                    <StatusBubbleText status={statusMap(batch.status)} size='md' icon={null} text={batch.status} />
                    {batch.priority}
                  </div>
                  <div className="p-3">{batch.totalTasks}</div>
                  <div className="p-3">
                    <FiCalendar className="inline mr-2" />
                    {new Date(batch.createdAt).toLocaleDateString()}
                  </div>
                  <div className="assigned-users flex items-center -gap-8 px-3">
                    {batch.assignedUsers.map((user) => (
                      <div key={user._id} className="avatar-item group -ml-2">
                        <div className="relative bg-white h-8 w-8 rounded-full shadow-[-4px_0_4px_0_#37415157]">
                        <Avatar
                          size="sm"
                          src={user.avatarUrl}
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                        <span className="avatar-name absolute opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs rounded px-2 py-1 -top-8 whitespace-nowrap">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-right flex justify-end gap-2">
                    <IconButton variant='primary' label='' shape='pill' onClick={() =>
                      window.location.href = `/task/task-batches/${batch._id}`
                    } icon={<FiFileText size="18" />} />


                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBatchList;
