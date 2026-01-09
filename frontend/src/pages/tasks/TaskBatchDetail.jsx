import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import Button from "../../components/common/Button";
import { FiMapPin, FiPhone, FiUser } from "react-icons/fi";
import Avatar from "../../components/common/Avatar";

const TaskBatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [batch, setBatch] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBatchDetail = async () => {
    setLoading(true);
    const [batchRes, taskRes] = await Promise.all([
      api.get(`/taskBatches/${id}`),
      api.get(`/tasks?taskBatchId=${id}`),
    ]);

    setBatch(batchRes.data.data);
    setTasks(taskRes.data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBatchDetail();
  }, [id]);

  if (loading) return <div className="p-6">Loading batch details…</div>;
  if (!batch) return <div className="p-6 text-red-500">Batch not found</div>;

  /* ======================
     ACTIONS
  ====================== */
  const handleDelete = async () => {
    if (!window.confirm("Delete this batch and all its tasks?")) return;
    await api.delete(`/taskBatches/${batch._id}`);
    navigate("/task/task-batches");
  };

  const handleStatusChange = async status => {
    await api.patch(`/taskBatches/${batch._id}/status`, { status });
    fetchBatchDetail();
  };

  /* ======================
     GROUP TASKS BY AGENT
  ====================== */
  const groupedTasks = tasks.reduce((acc, task) => {
    const key = task.assignedTo?._id || "unassigned";
    if (!acc[key]) {
      acc[key] = { assignedTo: task.assignedTo, tasks: [] };
    }
    acc[key].tasks.push(task);
    return acc;
  }, {});

  const progress = batch.progress || {};

  return (
    <div className="px-10 py-6 w-full flex gap-20 bg-white rounded-xl">
      {/* ======================
         LEFT PANEL
      ====================== */}
      <div className="w-xs space-y-6">
        {/* HEADER */}
        <div>
          <h2 className="text-2xl font-semibold">{batch.name}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Created on {new Date(batch.createdAt).toLocaleString()}
          </p>
        </div>

        {/* STATUS + PRIORITY */}
        <div className="flex gap-3 items-center">
          <span className="px-3 py-1 rounded text-sm bg-gray-100 capitalize">
            {batch.status}
          </span>
          <span className="px-3 py-1 rounded text-sm bg-yellow-100 capitalize">
            {batch.priority}
          </span>
        </div>

        {/* PURPOSE & OBJECTIVE */}
       

        {/* PROGRESS */}
        <div className="border p-4 rounded space-y-2">
          <div className="text-sm text-gray-500">Progress</div>
          <div className="text-sm">
            Pending: {progress.pending || 0}
          </div>
          <div className="text-sm">
            In Progress: {progress.inProgress || 0}
          </div>
          <div className="text-sm">
            Completed: {progress.completed || 0}
          </div>
          <div className="text-sm text-red-600">
            Failed: {progress.failed || 0}
          </div>
          <div className="text-sm font-medium mt-1">
            Total: {batch.totalTasks}
          </div>
        </div>

        {/* CREATED BY */}
        <div className="border p-4 rounded">
          <div className="text-sm text-gray-500">Created By</div>
          <div className="text-sm font-medium">
           
            <Avatar 
              src={batch.createdBy?.profilePic}
              alt={batch.createdBy?.firstName}
              size="sm"
            />
            <div>{batch.createdBy?.firstName} {batch.createdBy?.lastName || "—"}</div>
          </div>
        </div>

        {/* STATUS CONTROL */}
        <select
          value={batch.status}
          onChange={e => handleStatusChange(e.target.value)}
          className="border px-3 py-2 text-sm rounded"
        >
          <option value="draft">Draft</option>
          <option value="queued">Queued</option>
          <option value="running">Running</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>

        {/* ACTIONS */}
        <div className="flex gap-3">
          <Button onClick={() => window.history.back()}>
            Back
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>
       <div className="border p-4 rounded space-y-2 w-full">
          <div className="text-sm font-semibold">
            {batch.purposeAndObjective?.title || "Purpose & Objective"}
          </div>
          <div className="text-sm text-gray-700 rich-content" >
            <div dangerouslySetInnerHTML={{ __html: batch.purposeAndObjective?.summary || "—" }} />
          </div>
          {batch.purposeAndObjective?.agentGoal && (
            <div className="text-xs text-gray-500">
              Agent Goal: {batch.purposeAndObjective.agentGoal}
            </div>
          )}
        </div>

      {/* ======================
         RIGHT PANEL – TASKS
      ====================== */}
      <div className="w-full space-y-6">
        {Object.keys(groupedTasks).length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No tasks found for this batch
          </div>
        ) : (
          Object.values(groupedTasks).map((group, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-2xl p-4"
            >
              {/* ASSIGNED AGENT */}
              <div className="font-semibold mb-3">
                {group.assignedTo?.firstName || "Unassigned"}
              </div>

              {/* CONTACTS */}
              <div className="flex flex-col gap-2">
                {group.tasks.map((task, i) => (
                  <div
                    key={task._id}
                    className="bg-gray-100 border border-gray-300 p-3 rounded-md flex gap-4 items-center"
                  >
                    <span className="font-medium w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                      {i + 1}
                    </span>
                    <FiPhone />
                    <b>{task.contactId?.mobile}</b>
                    <FiMapPin />
                    {task.contactId?.preferredLanguage || "—"}
                    <FiUser />
                    {task.contactId?.firstName}{" "}
                    {task.contactId?.lastName || ""}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskBatchDetail;
