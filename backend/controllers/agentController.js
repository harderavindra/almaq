import CallLog from "../models/CallLog.js";
import Task from "../models/Task.js";
import TaskBatch from "../models/TaskBatch.js";

/* ======================================================
   GET TASKS FOR LOGGED-IN AGENT
   GET /api/agent/tasks
====================================================== */


export const getAgentTaskBatches = async (req, res) => {
  const agentId = req.user._id;

  const batches = await TaskBatch.find({
    _id: {
      $in: await Task.distinct("taskBatchId", {
        assignedTo: agentId,
      }),
    },
    status: { $in: ["queued", "running", "paused"] },
  })
    .select("name priority status progress createdAt")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: batches,
  });
};


export const getAgentTasks = async (req, res) => {
  try {
    const agentId = req.user._id;
    const { batchId } = req.params;


    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: "batchId is required",
      });
    }

    /* =============================
       LOAD TASKS FOR AGENT + BATCH
    ============================= */
    const tasks = await Task.find({
      assignedTo: agentId,
      taskBatchId: batchId,
    })
      .populate("contactId", "firstName lastName mobile")
      .lean()
      .sort({ dueAt: 1 });

    if (!tasks.length) {
      const batch = await TaskBatch.findById(batchId).select(
        "name priority status purposeAndObjective callOutcomeForm progress"
      );

      return res.json({
        success: true,
        batch,
        tasks: [],
      });
    }

    /* =============================
       LOAD BATCH ONCE
    ============================= */
    const batch = await TaskBatch.findById(batchId).select(
      "name priority status purposeAndObjective callOutcomeForm progress createdBy createdAt"
    ).populate("createdBy", "firstName lastName email profilePic");

    /* =============================
       LOAD LAST CALL PER TASK
    ============================= */
    const taskIds = tasks.map(t => t._id);

    const lastCalls = await CallLog.aggregate([
      { $match: { taskId: { $in: taskIds } } },
      { $sort: { callEnd: -1 } },
      {
        $group: {
          _id: "$taskId",
          disposition: { $first: "$disposition" },
          remarks: { $first: "$remarks" },
          callOutcome: { $first: "$callOutcome" }, // 🔑 critical
          callEnd: { $first: "$callEnd" },
          duration: { $first: "$duration" },
        },
      },
    ]);


    const callMap = {};
    lastCalls.forEach(c => {
      callMap[c._id.toString()] = c;
    });

    /* =============================
       ENRICH TASKS
    ============================= */
    const enrichedTasks = tasks.map(t => ({
      ...t,
      lastCall: callMap[t._id.toString()] || null,
    }));

    res.json({
      success: true,
      batch,
      tasks: enrichedTasks,
    });
  } catch (err) {
    console.error("GET AGENT TASKS FAILED:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch agent tasks",
    });
  }
};