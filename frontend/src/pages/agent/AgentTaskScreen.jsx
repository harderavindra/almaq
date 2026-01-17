import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import AgentObjectivePanel from "../../components/task/AgentObjectivePanel";
import Button from "../../components/common/Button";
import BatchOverviewCard from "../../components/reports/BatchOverviewCard";
import DispositionAnalysis from "../../components/reports/DispositionAnalysis";
import BatchOverview from "../../components/reports/BatchOverview";
import CallOutcomeAnalytics from "../../components/reports/CallOutcomeAnalytics";
import Avatar from "../../components/common/Avatar";
import { formatDateTime } from "../../utils/dateUtils";
import { FiClipboard, FiPaperclip, FiPhone, FiTarget, FiUser, FiX } from "react-icons/fi";
import StatusBubble from "../../components/common/StatusBubble";
import DialerPopover from "../../components/task/DialerPopover";
import TaskCardSkeleton from "../../components/task/TaskCardSkeleton";
const ANALYTICS_MODES = {
     CONTACTS: "contacts",
    ATTEMPTS: "attempts",
    COMPLETED: "completed",
   
};

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

const AgentTaskScreen = () => {
    const { batchId } = useParams();

    const [batch, setBatch] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [dispositions, setDispositions] = useState([]);
    const [dispositionFacts, setDispositionFacts] = useState([]);

    const [activeCall, setActiveCall] = useState(null);
    const [selectedDisposition, setSelectedDisposition] = useState(null);
    const [callOutcomeValues, setCallOutcomeValues] = useState({});
    const [loading, setLoading] = useState(true);

    const [historyTask, setHistoryTask] = useState(null);
    const [callHistory, setCallHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const [showCenterInfo, setShowCenterInfo] = useState(false);

    const [dialerOpen, setDialerOpen] = useState(false);
    const [dialerTask, setDialerTask] = useState(null);
    const [dialerIndex, setDialerIndex] = useState(0);
    const [selectedTab, setSelectedTab] = useState('pending');


    const [analyticsMode, setAnalyticsMode] = useState(ANALYTICS_MODES.CONTACTS);


    const startDialer = async (task, index) => {
        const res = await api.post("/disposition/calls/start", {
            taskId: task._id,
            contactId: task.contactId._id,
        });

        setDialerTask({
            ...task,
            callLogId: res.data.data.callLogId,
        });

        setDialerIndex(index);
        setDialerOpen(true);
    };

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
            setTasks(taskRes.data.tasks || []);
            setDispositions(dispRes.data.data || []);
            console.log("TASKS LOADED:", taskRes.data.tasks);
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



    const openHistory = async (task) => {
        setHistoryTask(task);
        setLoadingHistory(true);

        try {
            const res = await api.get(
                `/disposition/calls/history/${task._id}`
            );

            setCallHistory(res.data.data || []);
        } catch (err) {
            console.error("CALL HISTORY LOAD FAILED", err);
            setCallHistory([]);
        } finally {
            setLoadingHistory(false);
        }
    };
    const endDialerCall = async () => {
        const { remarks, ...cleanOutcome } = callOutcomeValues;

        await api.post("/disposition/calls/end", {
            callLogId: dialerTask.callLogId,
            dispositionCode: selectedDisposition,
            callOutcome: cleanOutcome,
            remarks,
        });

        setSelectedDisposition(null);
        setCallOutcomeValues({});

        const nextTask = tasks[dialerIndex + 1];
        if (nextTask) {
            startDialer(nextTask, dialerIndex + 1);
        } else {
            setDialerOpen(false);
            setDialerTask(null);
        }

        loadData();
    };

    const completedTasks = tasks.filter(
        (t) =>
            t.status === "completed" ||
            !!t.lastCall?.disposition
    );
    const inProgressTasks = tasks.filter(
        (t) =>
            t.status !== "completed" &&
            t.attemptCount > 0 &&
            !t.lastCall?.disposition
    );

    const pendingTasks = tasks.filter(
        (t) =>
            t.status !== "completed" &&
            t.attemptCount === 0
    );
    return (<div>
        {loading ? (
            <TaskCardSkeleton />
        ) : (
            <div className=" py-6 w-full flex gap-10 ">
                <div className="w-full   space-y-6 bg-white rounded-xl px-10 py-5 flex flex-col gap-6">
                    <div className="flex justify-between items-start gap-6">
                        <div className="w-full">
                            <h1 className="text-2xl font-semibold relative ">
                                {batch.name}
                                <button
                                    onClick={() => setShowCenterInfo((p) => !p)}
                                    className="absolute top-1 right-3"
                                >
                                    <FiClipboard size={24} />
                                </button>
                            </h1>
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
                            <div>
                                {dispositionFacts.map((d, index) => (
                                    <div
                                        key={index}
                                        className="px-3 py-1 bg-gray-100 rounded-full"
                                    >
                                        {(d._id ? d._id.replace(/-/g, " ") : "N/A")}:{" "}
                                        <span className="font-semibold">{d.count}</span>
                                    </div>
                                ))}


                                <div className="mt-3 text-xs text-gray-500">
                                    {/* Total Calls: {totalCalls} */}
                                </div>
                            </div>
                            {/* <BatchOverviewCard batchId={batchId} /> */}
                        </div>
                        <div className="w-[400px]">

                            <div className="inline-flex bg-gray-100 rounded-xl p-1">
                                {[
                                    { key: ANALYTICS_MODES.CONTACTS, label: "Contacts" },
                                    { key: ANALYTICS_MODES.ATTEMPTS, label: "Attempts" },
                                    { key: ANALYTICS_MODES.COMPLETED, label: "Completed" },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setAnalyticsMode(tab.key)}
                                        className={`px-4 py-2 text-sm rounded-lg transition
        ${analyticsMode === tab.key
                                                ? "bg-white shadow font-semibold"
                                                : "text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>


                            <DispositionAnalysis
                              batchId={batchId}
  mode={analyticsMode}
  onDispositionLoad={setDispositionFacts}
                            />
                        </div>
                    </div>
                    <div className="flex gap-6 ">

                        <div className="w-full ">
                            <CallOutcomeAnalytics batchId={batchId} batch={batch} />

                            <AgentObjectivePanel batch={batch} />
                        </div>
                    </div>
                </div>
                <div className="call-tab-conatiner w-full max-w-lg">
                    <div className="flex  gap-2 px-6">
                        <button className={`${selectedTab === "pending" ? "bg-white" : "bg-gray-200"} rounded-t-xl px-5 py-2 cursor-pointer`} onClick={() => setSelectedTab("pending")}>  Pending</button>
                        <button className={`${selectedTab === 'completed' ? "bg-white" : "bg-gray-200"} rounded-t-xl px-5 py-2 cursor-pointer`} onClick={() => setSelectedTab('completed')}>Completed</button>
                    </div>
                    {selectedTab === 'completed' && (
                        <div className="w-full relative bg-white rounded-xl px-10 py-5">
                            <div
                                className={`transition-all duration-300 ease-out overflow-hidden absolute w-full min-h-screen -left-0 top-0 bg-white rounded-xl  shadow-xl border border-gray-100
    ${showCenterInfo ? "max-h-[500px] opacity-100 mb-6 z-10" : "max-h-0 opacity-0"}
  `}
                            >
                                <h2 className="text-xl font-semibold  relative p-4">Purpose & Objective
                                    <button
                                        onClick={() => setShowCenterInfo((p) => !p)}
                                        className="ml-2 text-sm text-gray-600 absolute top-5 right-2"
                                    >
                                        <FiX size={32} />
                                    </button>
                                </h2>
                                <div className=" border-b border-gray-300"></div>
                                <div className="p-5  overflow-y-auto ">
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

                                </div>
                            </div>
                            <div className="w-full flex flex-col gap-4">
                                <h3 className="text-lg font-semibold text-gray-700">
                                    Completed Calls
                                </h3>
                                <div className="flex flex-col gap-4 h-full overflow-y-auto pb-20">
                                    {completedTasks.length === 0 ? (
                                        <div className="text-sm text-gray-400">
                                            No completed calls yet.
                                        </div>
                                    ) : (
                                        completedTasks.map((task) => {
                                            const outcomeUI =
                                                dispositionStatusMap[task?.lastCall?.disposition];

                                            return (

                                                <div key={task._id}
                                                    className={`transition-all duration-300 ease-out ${loading ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                                                        }`}
                                                >
                                                    <div className="border border-gray-300 rounded-2xl p-4 flex justify-between items-start" >
                                                        {/* LEFT SECTION */}
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex justify-start items-start gap-3">

                                                                <div className="flex  gap-2 justify-center items-center text-lg text-gray-600 font-semibold">
                                                                    <FiPhone /> {task.contactId.mobile}
                                                                </div>
                                                                <div className="flex  gap-2 justify-center items-center text-lg text-gray-600 font-semibold">
                                                                    <FiUser /> {task.contactId.firstName} {task.contactId.lastName}
                                                                </div>



                                                            </div>

                                                            {/* RIGHT SECTION */}
                                                            <div className="flex  justify-between items-start">

                                                                <div className="">
                                                                    {task.lastCall ? (
                                                                        <div className=" flex items-center gap-3 flex-wrap">
                                                                            <StatusBubble
                                                                                size="sm"
                                                                                status={outcomeUI?.status || "info"}
                                                                                icon={outcomeUI?.icon || "info"}
                                                                            />
                                                                            <span className="capitalize font-medium">
                                                                                {outcomeUI?.label || task.lastCall.disposition}
                                                                            </span>




                                                                            {task.lastCall.remarks && (
                                                                                <span className="text-gray-600">
                                                                                    — {task.lastCall.remarks}
                                                                                </span>
                                                                            )}


                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-xs text-gray-400 pl-10">
                                                                            No call attempted yet
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <span className="text-base flex items-center gap-2 ml-4 text-gray-400">
                                                                    <FiTarget /> {task.attemptCount}/{task.maxAttempts}
                                                                </span>
                                                                <button
                                                                    onClick={() => openHistory(task)}
                                                                    className="text-sm  flex items-center gap-2 ml-2"
                                                                >
                                                                    <FiClipboard />
                                                                    Call History
                                                                </button>

                                                            </div>
                                                        </div>
                                                        {task.status !== "completed" && (
                                                            <button className="rounded-full bg-blue-600 text-white h-12 w-12 flex items-center justify-center" onClick={() => startCall(task)}
                                                                disabled={!!activeCall && activeCall.task._id !== task._id}

                                                            >
                                                                <FiPhone className="text-lg" />
                                                            </button>


                                                        )}

                                                    </div>
                                                </div>
                                            )
                                        })

                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {inProgressTasks.length > 0 && (
                        <div className="w-full">
                            <h4 className="text-sm font-semibold text-yellow-600 mb-2">
                                In Progress Calls
                            </h4>
                            {inProgressTasks.map(task => (
                                <div key={task._id} className="text-sm text-gray-600">
                                    {task.contactId.mobile} – Call in progress
                                </div>
                            ))}
                        </div>
                    )}
                    {selectedTab === 'pending' && (
                        <div className="w-full mx-auto p-6 space-y-6 bg-white rounded-xl px-10 py-5 flex flex-col items-center">

                            <button
                                disabled={pendingTasks.length === 0}
                                onClick={() => startDialer(pendingTasks[0], 0)}
                                className={`rounded-full h-12 px-6 gap-3 flex items-center justify-center
    ${pendingTasks.length === 0
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "bg-blue-600 text-white"
                                    }`}
                            >
                                <FiPhone /> Start Dialer
                            </button>
                            {

                                pendingTasks.map((task, index) => {
                                    const outcomeUI =
                                        dispositionStatusMap[task?.lastCall?.disposition];

                                    return (
                                        <div key={task._id}
                                            className={`transition-all duration-300 ease-out ${loading ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                                                }`}
                                        >
                                            <div className="border border-gray-300 rounded-2xl p-4 flex justify-between items-start" >
                                                {/* LEFT SECTION */}
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex justify-start items-start gap-3">

                                                        <div className="flex  gap-2 justify-center items-center text-lg text-gray-600 font-semibold">
                                                            <FiPhone /> {task.contactId.mobile}
                                                        </div>
                                                        <div className="flex  gap-2 justify-center items-center text-lg text-gray-600 font-semibold">
                                                            <FiUser /> {task.contactId.firstName} {task.contactId.lastName}
                                                        </div>



                                                    </div>

                                                    {/* RIGHT SECTION */}
                                                    <div className="flex  justify-between items-start">

                                                        <div className="">
                                                            {task.lastCall ? (
                                                                <div className=" flex items-center gap-3 flex-wrap">
                                                                    <StatusBubble
                                                                        size="sm"
                                                                        status={outcomeUI?.status || "info"}
                                                                        icon={outcomeUI?.icon || "info"}
                                                                    />
                                                                    <span className="capitalize font-medium">
                                                                        {outcomeUI?.label || task.lastCall.disposition}
                                                                    </span>




                                                                    {task.lastCall.remarks && (
                                                                        <span className="text-gray-600">
                                                                            — {task.lastCall.remarks}
                                                                        </span>
                                                                    )}


                                                                </div>
                                                            ) : (
                                                                <div className="text-xs text-gray-400 pl-10">
                                                                    No call attempted yet
                                                                </div>
                                                            )}
                                                        </div>

                                                        <span className="text-base flex items-center gap-2 ml-4 text-gray-400">
                                                            <FiTarget /> {task.attemptCount}/{task.maxAttempts}
                                                        </span>
                                                        <button
                                                            onClick={() => openHistory(task)}
                                                            className="text-sm  flex items-center gap-2 ml-2"
                                                        >
                                                            <FiClipboard />
                                                            Call History
                                                        </button>

                                                    </div>
                                                </div>
                                                {task.status !== "completed" && (
                                                    <button className="rounded-full bg-blue-600 text-white h-12 w-12 flex items-center justify-center" onClick={() => startCall(task)}
                                                        disabled={!!activeCall && activeCall.task._id !== task._id}

                                                    >
                                                        <FiPhone className="text-lg" />
                                                    </button>


                                                )}

                                            </div>
                                        </div>


                                    )
                                })
                            }

                            {/* =====================
                            DISPOSITION MODAL
                        ===================== */}
                            {activeCall && (
                                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                                    <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
                                        <h3 className="font-semibold">
                                            Call Outcome – {activeCall.task.contactId.firstName}
                                        </h3>

                                        <div className="flex flex-col gap-4">
                                            <label className="text-sm font-medium pb-6">
                                                Call Disposition
                                            </label>

                                            <div className="grid grid-cols-3 gap-3">
                                                {dispositions.map((d) => (
                                                    <button
                                                        key={d._id}
                                                        type="button"
                                                        onClick={() => setSelectedDisposition(d.code)}
                                                        className={` border border-blue-100  rounded-lg p-3 text-center flex flex-col justify-center items-center transition
                                                ${selectedDisposition === d.code
                                                                ? "border-blue-500 bg-blue-50"
                                                                : "hover:border-gray-400"
                                                            }`}
                                                    >
                                                        <FiPhone className="text-lg flex justify-center items-center " />
                                                        <div className="font-medium text-xs">
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
                    )}
                </div>
                {historyTask && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold">
                                    Call History – {historyTask.contactId.firstName}
                                </h3>
                                <button
                                    className="text-sm text-gray-500"
                                    onClick={() => {
                                        setHistoryTask(null);
                                        setCallHistory([]);
                                    }}
                                >
                                    Close
                                </button>
                            </div>

                            {loadingHistory ? (
                                <div className="text-sm text-gray-400">Loading history…</div>
                            ) : callHistory.length === 0 ? (
                                <div className="text-sm text-gray-400">
                                    No previous calls found.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {callHistory.map((call) => (
                                        <div
                                            key={call._id}
                                            className="border rounded-lg p-3 text-sm space-y-1"
                                        >
                                            <div className="flex justify-between">
                                                <span className="font-medium capitalize">
                                                    {call.disposition}
                                                </span>
                                                <span className="text-gray-500">
                                                    {formatDateTime(call.createdAt)}
                                                </span>
                                            </div>

                                            {call.remarks && (
                                                <div className="text-gray-600">
                                                    {call.remarks}
                                                </div>
                                            )}

                                            {call.callOutcome && (
                                                <div className="pt-1 space-y-1">
                                                    {Object.entries(call.callOutcome).map(([k, v]) => (
                                                        <div
                                                            key={k}
                                                            className="flex justify-between text-xs"
                                                        >
                                                            <span className="capitalize">
                                                                {k.replace(/([A-Z])/g, " $1")}
                                                            </span>
                                                            <span>
                                                                {typeof v === "boolean"
                                                                    ? v ? "Yes" : "No"
                                                                    : !isNaN(Date.parse(v))
                                                                        ? formatDateTime(v)
                                                                        : String(v)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <DialerPopover
                    open={dialerOpen}
                    task={dialerTask}
                    dispositions={dispositions}
                    batch={batch}
                    selectedDisposition={selectedDisposition}
                    setSelectedDisposition={setSelectedDisposition}
                    callOutcomeValues={callOutcomeValues}
                    setCallOutcomeValues={setCallOutcomeValues}
                    isFieldVisible={isFieldVisible}
                    onEndCall={endDialerCall}
                    onClose={() => {
                        setDialerOpen(false);
                        setDialerTask(null);
                    }}
                />

            </div>
        )}
    </div>
    );
};

export default AgentTaskScreen;
