import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import AgentObjectivePanel from "../../components/task/AgentObjectivePanel";
import Button from "../../components/common/Button";
import BatchOverviewCard from "../../components/reports/BatchOverviewCard";
import DispositionAnalysis from "../../components/reports/DispositionAnalysis";
import BatchOverview from "../../components/reports/BatchOverview";
import CallOutcomeAnalytics from "../../components/reports/CallOutcomeAnalytics";

const dispositionUI = {
    connected: {
        label: "Connected",
        color: "green",
    },
    "no-answer": {
        label: "No Answer",
        color: "yellow",
    },
    busy: {
        label: "Busy",
        color: "yellow",
    },
    callback: {
        label: "Callback",
        color: "orange",
    },
    default: {
        label: "Not Called",
        color: "gray",
    },
};


const AgentTaskScreen = () => {
    const { batchId } = useParams();

    const [batch, setBatch] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [dispositions, setDispositions] = useState([]);

    const [activeCall, setActiveCall] = useState(null);
    const [selectedDisposition, setSelectedDisposition] = useState(null);
    const [callOutcomeValues, setCallOutcomeValues] = useState({});
    const [loading, setLoading] = useState(true);

    /* =====================
       LOAD DATA
    ===================== */
    const loadData = async () => {
        try {
            setLoading(true);
            const [taskRes, dispRes] = await Promise.all([
                api.get(`/agents/task-batches/${batchId}`),
                api.get("/disposition/dispositions"),
            ]);

            setBatch(taskRes.data.batch);
            console.log("Loaded batch:", taskRes.data.batch);
            setTasks(taskRes.data.tasks || []);
            setDispositions(dispRes.data.data || []);
        } catch (err) {
            console.error("AGENT TASK LOAD FAILED", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [batchId]);

    /* =====================
       VISIBILITY RULE
    ===================== */
    const isFieldVisible = (field) => {
        if (!field.visibleWhen) return true;
        return (
            callOutcomeValues[field.visibleWhen.field] ===
            field.visibleWhen.equals
        );
    };

    /* =====================
       START CALL
    ===================== */
    const startCall = async (task) => {
        const res = await api.post("/disposition/calls/start", {
            taskId: task._id,
            contactId: task.contactId._id,
        });

        setActiveCall({
            task,
            callLogId: res.data.data.callLogId,
        });
    };

    /* =====================
       SUBMIT DISPOSITION
    ===================== */
    const submitDisposition = async () => {
       
        const { remarks, ...cleanOutcome } = callOutcomeValues;

        await api.post("/disposition/calls/end", {
            callLogId: activeCall.callLogId,
            dispositionCode: selectedDisposition,
            callOutcome: cleanOutcome,
            remarks,
        });

        setActiveCall(null);
        setSelectedDisposition(null);
        setCallOutcomeValues({});
        loadData();
    };

    const activeDisposition = dispositions.find(
  d => d.code === selectedDisposition
);
    /* =====================
       UI STATES
    ===================== */
    if (loading) return <div className="p-6">Loading tasks…</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <AgentObjectivePanel purpose={batch?.purposeAndObjective} />
                    <DispositionAnalysis batchId={batchId} />
                    <BatchOverview batchId={batchId} />
                         <CallOutcomeAnalytics
  batchId={batchId}
  batch={batch}
/>


<BatchOverviewCard batchId={batchId} />
            {tasks.map((task, index) => (
                <div className="border rounded-xl p-4 bg-white flex justify-between gap-4">
                    {/* LEFT SECTION */}
                    <div className="space-y-1">
                        <div className="text-xs text-gray-500">
                            Task {index + 1} of {tasks.length}
                        </div>

                        <div className="font-semibold text-gray-900">
                            {task.contactId.firstName} {task.contactId.lastName}
                        </div>

                        <div className="text-sm text-gray-600">
                            📞 {task.contactId.mobile}
                        </div>

                        {/* STATUS ROW */}
                        <div className="flex items-center gap-2 pt-2">
                            {task.lastCall ? (
                                <>
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full `}
                                    >
                                        {
                                            dispositionUI[task.lastCall.disposition]?.label ||
                                            dispositionUI.default.label
                                        }
                                    </span>

                                    <span className="text-xs text-gray-500">
                                        {task.lastCall.duration}s
                                    </span>
                                </>
                            ) : (
                                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                    Not Called
                                </span>
                            )}
                        </div>

                        {/* OUTCOME SUMMARY */}
                        {task.lastCall?.callOutcome && (
//                            callOutcome: {

//                                 {
//     "interested": true,
//     "demoScheduledAt": "2026-01-16T10:00",
//     "followUpRequired": true,
//     "followUpAt": "2026-01-22T12:02"
// }
<div>
 {task.lastCall.callOutcome &&
  Object.entries(task.lastCall.callOutcome)
    .map(([key, value]) => (
      <div key={key} className="flex justify-between text-sm">
        <span className="font-medium capitalize">
          {key.replace(/([A-Z])/g, " $1")}
        </span>
        <span>
  {typeof value === "boolean"
    ? value ? "Yes" : "No"
    : !isNaN(Date.parse(value))
      ? new Date(value).toLocaleString()
      : String(value)}
</span>
      </div>
    ))}


                         
                            
                            </div>
                        )}
                    </div>

                    {/* RIGHT SECTION */}
                    <div className="flex flex-col justify-between items-end">
                        <span className="text-xs text-gray-400">
                            Attempts {task.attemptCount}/{task.maxAttempts}
                        </span>
                      {task.status !== "completed" && (

                        <Button
                            size="sm"
                            onClick={() => startCall(task)}
                           disabled={!!activeCall && activeCall.task._id !== task._id}
                            variant={task.status === "completed" ? "secondary" : "primary"}
                        >
                          Call 
                        </Button>
                      )}
                    </div>

                </div>


            ))}

            {/* =====================
         DISPOSITION MODAL
      ===================== */}
            {activeCall && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
                        <h3 className="font-semibold">
                            Call Outcome – {activeCall.task.contactId.firstName}
                        </h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Call Disposition
                            </label>

                            <div className="grid grid-cols-2 gap-3">
                                {dispositions.map((d) => (
                                    <button
                                        key={d._id}
                                        type="button"
                                        onClick={() => setSelectedDisposition(d.code)}
                                        className={`border rounded-lg p-3 text-left transition
                                                ${selectedDisposition === d.code
                                                ? "border-blue-500 bg-blue-50"
                                                : "hover:border-gray-400"
                                            }`}
                                    >
                                        <div className="font-medium text-sm">
                                            {d.label}
                                        </div>

                                        {d.description && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                {d.description}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {activeDisposition?.requiresCallOutcome && (
                            <div className="space-y-4">


                                {
                                    batch.callOutcomeForm.fields.map((field) =>
                                        isFieldVisible(field) ? (
                                            <div key={field.key}>
                                                <label className="text-sm font-medium">
                                                    {field.label}
                                                </label>

                                                {field.type === "boolean" && (
                                                    <select
                                                        className="border p-2 w-full"
                                                        onChange={(e) =>
                                                            setCallOutcomeValues((p) => ({
                                                                ...p,
                                                                [field.key]: e.target.value === "true",
                                                            }))
                                                        }
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="true">Yes</option>
                                                        <option value="false">No</option>
                                                    </select>
                                                )}

                                                {field.type === "datetime" && (
                                                    <input
                                                        type="datetime-local"
                                                        className="border p-2 w-full"
                                                        onChange={(e) =>
                                                            setCallOutcomeValues((p) => ({
                                                                ...p,
                                                                [field.key]: e.target.value,
                                                            }))
                                                        }
                                                    />
                                                )}

                                                {field.type === "textarea" && (
                                                    <textarea
                                                        className="border p-2 w-full"
                                                        rows={3}
                                                        onChange={(e) =>
                                                            setCallOutcomeValues((p) => ({
                                                                ...p,
                                                                [field.key]: e.target.value,
                                                            }))
                                                        }
                                                    />
                                                )}
                                            </div>
                                        ) : null
                                    )}
                                    </div>
                        )}

                                <div className="grid grid-cols-2 gap-2 pt-3">
                                    <Button onClick={submitDisposition}>Submit</Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setActiveCall(null)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                </div>
            )}
                </div>
            );
};

            export default AgentTaskScreen;
