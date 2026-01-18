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
    const DISPOSITION_COLORS = {
        connected: "#2ecc71",        // green
        busy: "#f39c12",             // orange
        "no answer": "#f1c40f",       // yellow
        callback: "#3498db",          // blue
        "not interested": "#e74c3c",  // red
        "wrong number": "#9b59b6",    // purple
        dnd: "#34495e",               // dark gray
        "Not Disposed": "#95a5a6",    // light gray (attempts only)
    };

    const getColorForDisposition = (name) => {
        return DISPOSITION_COLORS[name] || "#bdc3c7"; // fallback gray
    };

    const startDialer = async (task, index = 0, mode = "single") => {
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
            <div className=" py-6 w-full flex gap-10">
                <div className="w-full   space-y-6 bg-white rounded-xl px-10 py-5 flex flex-col gap-6">
                    <div className="flex justify-between items-start gap-6">
                        <div className="w-full  ">
                            <h1 className="text-2xl font-semibold relative  ">
                                {batch.name}
                                <button
                                    onClick={() => setShowCenterInfo((p) => !p)}
                                    className="absolute top-1 right-3"
                                >
                                    <FiClipboard size={24} />
                                </button>
                            </h1>
                            <div className="text-sm flex gap-4 items-center mb-5 ">
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
                            <h2 className="mb-3 font-semibold">{analyticsMode === ANALYTICS_MODES.COMPLETED ? "Completed Calls (Performance)" : analyticsMode === ANALYTICS_MODES.ATTEMPTS ? "Dial Attempts (Operational)" : analyticsMode === ANALYTICS_MODES.CONTACTS ? "Final Contact Outcome" : ""}</h2>

                            <div className="flex gap-3">
                                {dispositionFacts.map((d, index) => (
                                    <div
                                        key={index}
                                        className="px-3 py-3 border border-gray-300 rounded-xl text-xs flex flex-col w-full text-center items-center gap-2 uppercase"
                                    >
                                        <span className={`font-semibold text-lg w-8 h-8 rounded-full text-white`} style={{ background: getColorForDisposition(d._id.replace(/-/g, " ")) }}>{d.count}</span>

                                        {(d._id ? d._id.replace(/-/g, " ") : "N/A")}{" "}
                                    </div>
                                ))}



                            </div>
                            {/* <BatchOverviewCard batchId={batchId} /> */}
                        </div>
                        <div className="w-[400px]">

                            <div className="inline-flex bg-gray-100 rounded-xl p-1 mb-3">
                                {[
                                    { key: ANALYTICS_MODES.CONTACTS, label: "Contacts" },
                                    { key: ANALYTICS_MODES.ATTEMPTS, label: "Attempts" },
                                    { key: ANALYTICS_MODES.COMPLETED, label: "Completed" },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setAnalyticsMode(tab.key)}
                                        className={`px-4 py-2 text-sm rounded-lg transition ${analyticsMode === tab.key
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
                <div className="call-tab-conatiner w-full max-w-[520px]">
                    <div className="flex  gap-2 px-6">
                        <button className={`${selectedTab === "pending" ? "bg-white" : "bg-gray-200"} rounded-t-xl px-5 py-2 cursor-pointer`} onClick={() => setSelectedTab("pending")}>  Pending</button>
                        <button className={`${selectedTab === 'completed' ? "bg-white" : "bg-gray-200"} rounded-t-xl px-5 py-2 cursor-pointer`} onClick={() => setSelectedTab('completed')}>Completed</button>
                    </div>
                    {selectedTab === 'completed' && (
                        <div className="w-full relative bg-white rounded-xl px-10 py-5">

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
                                                            <button
                                                                className={`rounded-full h-12 w-12 flex items-center justify-center
    ${dialerOpen ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 text-white"}
  `}
                                                                disabled={dialerOpen}
                                                                onClick={() => startDialer(task)}
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
                                                    <button
                                                        className={`rounded-full h-12 w-12 flex items-center justify-center
    ${dialerOpen ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 text-white"}
  `}
                                                        disabled={dialerOpen}
                                                        onClick={() => startDialer(task)}
                                                    >
                                                        <FiPhone className="text-lg" />
                                                    </button>


                                                )}

                                            </div>
                                        </div>


                                    )
                                })
                            }


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

        <div
            className={`fixed inset-y-0 left-0 w-full max-w-lg px-6 py-4 bg-black/50
    transition-transform duration-300 ease-out z-40 
    ${showCenterInfo ? "translate-x-0" : "-translate-x-full"}
  `}
        >
            <div className="bg-white shadow-xl border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold">
                    Purpose & Objective
                </h2>
                <button
                    onClick={() => setShowCenterInfo(false)}
                    className="text-gray-600"
                >
                    <FiX size={28} />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="h-[calc(100vh-64px)] overflow-y-auto p-5">
                <div className="font-medium mb-2">
                    {batch?.purposeAndObjective?.title || "Purpose & Objective"}
                </div>

                <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                        __html: batch?.purposeAndObjective?.summary || "—",
                    }}
                />

{batch?.purposeAndObjective?.agentGoal && (
                    <div className="mt-4 text-xs text-gray-500">
                        Agent Goal: {batch?.purposeAndObjective?.agentGoal}
                    </div>
                )}
            </div>
            </div>
        </div>

    </div>
    );
};

export default AgentTaskScreen;
