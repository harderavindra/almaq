import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import Button from "../../components/common/Button";
import { FiMapPin, FiPhone, FiUser } from "react-icons/fi";
import Avatar from "../../components/common/Avatar";
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import StatusBubbleText from "../../components/common/StatusBubbleText";
import StatusBubble from "../../components/common/StatusBubble";


const dispositionStatusMap = {
    connected: {
        status: "success",
        icon: "phoneCall",
        label: "Connected",
        borderColor: "border-green-500 bg-green-50",
    },
    interested: {
        status: "success",
        icon: "thumbsUp",
        label: "Interested",
    },

    callback: {
        status: "warning",
        icon: "clock",
        label: "Callback",
    },
    "no-answer": {
        status: "warning",
        icon: "FiPhoneMissed",
        label: "No Answer",
    },
    busy: {
        status: "warning",
        icon: "FiPhoneMissed",
        label: "Busy",
    },

    "not-interested": {
        status: "error",
        icon: "thumbsDown",
        label: "Not Interested",
        borderColor: "border-red-500",
    },
    dnd: {
        status: "error",
        icon: "FiXCircle",
        label: "DND",
    },
    "wrong-number": {
        status: "error",
        icon: "phoneOff",
        label: "Wrong Number",
    },
};
const TaskBatchDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [previewValues, setPreviewValues] = useState({});

    const [batch, setBatch] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);


    const [historyTask, setHistoryTask] = useState(null);
    const [callHistory, setCallHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);


    const fetchBatchDetail = async () => {
        setLoading(true);
        const [batchRes, taskRes] = await Promise.all([
            api.get(`/taskBatches/${id}`),
            api.get(`/tasks?taskBatchId=${id}`),
        ]);

        console.log("BATCH RES:", batchRes.data);
        console.log("TASK RES:", taskRes.data);

        setBatch(batchRes.data.data);
        setTasks(taskRes.data.data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchBatchDetail();
    }, [id]);


    const openHistory = async (task) => {
        console.log("OPEN HISTORY FOR TASK:", task);
        setHistoryTask(task);
        setLoadingHistory(true);

        const res = await api.get(`/disposition/calls/history/${task}`);
        console.log("CALL HISTORY RES:", res.data);
        setCallHistory(res.data.data || []);
        setLoadingHistory(false);
    };


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


    const isPreviewFieldVisible = (field) => {
        if (!field.visibleWhen) return true;

        const { field: dependsOn, equals } = field.visibleWhen;
        return previewValues[dependsOn] === equals;
    };

    return (
        <div className="px-10 py-6 w-full flex gap-20 bg-white rounded-xl">
            {/* ======================
         LEFT PANEL
      ====================== */}
            <div className="w-lg space-y-6">
                {/* HEADER */}
                <div>
                    <h2 className="text-2xl font-semibold">{batch.name}</h2>

                    <div className="text-sm flex gap-4 items-center ">

                        <Avatar
                            src={batch.createdBy?.profilePic}
                            alt={batch.createdBy?.firstName}
                            size="sm"
                        />
                        <div className="capitalize">
                            <p className="font-medium "> {batch.createdBy?.firstName} {batch.createdBy?.lastName || "—"}</p>
                            <p>{formatDateTime(batch.createdAt)}</p>
                        </div>
                    </div>
                </div>

                {/* STATUS + PRIORITY */}
                <div className="flex gap-3 items-center">
                    <StatusBubbleText status="error" size='sm' icon={batch} text={batch.status} />
                    <StatusBubbleText status="success" size='sm' icon={batch} text={batch.priority} />

                </div>

                {/* PURPOSE & OBJECTIVE */}


                {/* PROGRESS */}
                <div className="">
                    <p>Call/Task :  {batch.totalTasks}</p>
                    <div className=" flex items-center gap-4 mt-3">
                        <StatusBubble icon="clock" status="info" size="sm" />
                        {progress.pending || 0}
                        <StatusBubble icon="star" status="warning" size="sm" />
                        {progress.inProgress || 0}
                        <StatusBubble icon="rocket" status="success" size="sm" />
                        {progress.completed || 0}
                        <StatusBubble icon="reject" status="error" size="sm" />
                        {progress.failed || 0}
                    </div>

                </div>

                {/* CREATED BY */}

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
            <div className="bg-gray-100 p-8 rounded-xl space-y-2 w-full">
                <div className="">
                    {batch.purposeAndObjective?.title || "Purpose & Objective"}
                </div>
                <div className="" >
                    <div dangerouslySetInnerHTML={{ __html: batch.purposeAndObjective?.summary || "—" }} />
                </div>
                {batch.purposeAndObjective?.agentGoal && (
                    <div className="text-xs text-gray-500">
                        Agent Goal: {batch.purposeAndObjective.agentGoal}
                    </div>
                )}

                <div>
                   <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
  <div className="flex justify-between items-center">
    <h3 className="font-semibold text-sm text-gray-700">
      Call Outcome Form (Agent Preview)
    </h3>
    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
      Preview Only
    </span>
  </div>

  {!batch.callOutcomeForm?.fields?.length ? (
    <p className="text-sm text-gray-400">
      No call outcome form configured
    </p>
  ) : (
    <div className="space-y-4">
      {[...batch.callOutcomeForm.fields]
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((field) => {
          if (!isPreviewFieldVisible(field)) return null;

          return (
            <div key={field._id} className="space-y-1">
              <label className="text-sm font-medium">
                {field.label}
                {field.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>

              {/* BOOLEAN */}
              {field.type === "boolean" && (
                <select
                  className="border p-2 w-full text-sm"
                  value={
                    previewValues[field.key] === undefined
                      ? ""
                      : String(previewValues[field.key])
                  }
                  onChange={(e) =>
                    setPreviewValues((prev) => ({
                      ...prev,
                      [field.key]:
                        e.target.value === ""
                          ? undefined
                          : e.target.value === "true",
                    }))
                  }
                >
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              )}

              {/* DATETIME */}
              {field.type === "datetime" && (
                <input
                  type="datetime-local"
                  className="border p-2 w-full text-sm"
                  value={previewValues[field.key] || ""}
                  onChange={(e) =>
                    setPreviewValues((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                />
              )}

              {/* TEXT */}
              {field.type === "text" && (
                <input
                  type="text"
                  className="border p-2 w-full text-sm"
                  value={previewValues[field.key] || ""}
                  onChange={(e) =>
                    setPreviewValues((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                />
              )}

              {/* TEXTAREA */}
              {field.type === "textarea" && (
                <textarea
                  className="border p-2 w-full text-sm"
                  rows={3}
                  value={previewValues[field.key] || ""}
                  onChange={(e) =>
                    setPreviewValues((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                />
              )}

              {/* SELECT */}
              {field.type === "select" && (
                <select
                  className="border p-2 w-full text-sm"
                  value={previewValues[field.key] || ""}
                  onChange={(e) =>
                    setPreviewValues((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                >
                  <option value="">Select</option>
                  {(field.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        })}
    </div>
  )}
</div>
                </div>
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
                                {group.tasks.map((task, i) => {
                                    const outcomeUI =
                                        dispositionStatusMap[task?.lastCall?.disposition];

                                    return (
                                        <div
                                            key={task._id}
                                            className={`rounded-md p-3 border flex flex-col gap-1 ${outcomeUI?.borderColor || "border-gray-300"
                                                }`}
                                        >
                                            {/* TOP ROW */}
                                            <div className="flex gap-4 items-center">
                                                <span className="font-medium w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                                                    {i + 1}
                                                </span>

                                                <FiPhone />
                                                <b>{task._doc.contactId?.mobile}</b>

                                                <FiUser />
                                                {task._doc.contactId?.firstName}{" "}
                                                {task._doc.contactId?.lastName || ""}

                                                {task.lastCall ? (
                                                    <div className="pl-10 flex items-center gap-3 flex-wrap">
                                                        <span className="capitalize font-medium">
                                                            {outcomeUI?.label || task.lastCall.disposition}
                                                        </span>
                                                        <StatusBubble
                                                            size="sm"
                                                            status={outcomeUI?.status || "info"}
                                                            icon={outcomeUI?.icon || "info"}
                                                        />



                                                        {task.lastCall.remarks && (
                                                            <span className="text-gray-600">
                                                                — {task.lastCall.remarks}
                                                            </span>
                                                        )}

                                                        <button
                                                            onClick={() => openHistory(task._id)}
                                                            className="text-xs text-blue-600 underline ml-2"
                                                        >
                                                            View call history
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-gray-400 pl-10">
                                                        No call attempted yet
                                                    </div>
                                                )}
                                            </div>

                                            {/* OUTCOME */}

                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {historyTask && (
                <div className="fixed inset-0 z-50 flex">
                    {/* Overlay */}
                    <div
                        className="flex-1 bg-black/30"
                        onClick={() => setHistoryTask(null)}
                    />

                    {/* Drawer */}
                    <div className="w-[420px] bg-white p-5 overflow-y-auto">
                        {/* HEADER */}
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg">
                                Call History
                            </h3>
                            <button
                                onClick={() => setHistoryTask(null)}
                                className="text-sm text-gray-500"
                            >
                                Close
                            </button>
                        </div>

                        {/* CONTACT INFO (NOT AGENT) */}
                        <div className="mb-4 text-sm border-b pb-3">
                            <div className="font-medium">
                                {callHistory[0].contactId?.firstName}{" "}
                                {callHistory[0].contactId?.lastName}
                                {callHistory[0].contactId?.mobile}


                            </div>
                            <div className="text-gray-500">
                                {historyTask.contactId?.mobile}
                            </div>
                        </div>

                        {/* HISTORY LIST */}
                        {loadingHistory ? (
                            <div className="text-sm text-gray-500">
                                Loading history…
                            </div>
                        ) : callHistory.length === 0 ? (
                            <div className="text-sm text-gray-400">
                                No calls made yet
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {callHistory.map((log, index) => (
                                    <div
                                        key={log._id}
                                        className="border rounded-md p-3 text-sm"
                                    >
                                        {/* DISPOSITION + TIME */}
                                        <div className="flex justify-between">
                                            <div className="font-medium capitalize">
                                                {log.disposition}
                                            </div>
                                            <div className="text-gray-500">
                                                {new Date(log.callEnd).toLocaleString()}
                                            </div>
                                        </div>

                                        {/* AGENT */}
                                        <div className="text-xs text-gray-500 mt-1">
                                            Agent: {log.userId?.firstName}{" "}
                                            {log.userId?.lastName}
                                        </div>

                                        {/* REMARKS */}
                                        {log.remarks && (
                                            <div className="mt-2 text-gray-700">
                                                {log.remarks}
                                            </div>
                                        )}

                                        {/* DURATION */}
                                        <div className="mt-1 text-xs text-gray-500">
                                            Duration: {log.duration}s
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};

export default TaskBatchDetail;
