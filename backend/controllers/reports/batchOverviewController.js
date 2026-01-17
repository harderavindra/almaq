import Task from "../../models/Task.js";
import CallLog from "../../models/CallLog.js";
import mongoose from "mongoose";

export const batchOverview = async (req, res) => {
  try {
    const { batchId } = req.params;
    const batchObjectId = new mongoose.Types.ObjectId(batchId);

    /* ===============================
       TASK STATUS SUMMARY
    =============================== */
    const taskStats = await Task.aggregate([
      { $match: { taskBatchId: batchObjectId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const taskSummary = {
      total: 0,
      pending: 0,
      completed: 0,
      cancelled: 0,
    };

    taskStats.forEach((t) => {
      taskSummary[t._id] = t.count;
      taskSummary.total += t.count;
    });

    /* ===============================
       CALL SUMMARY
    =============================== */
    const callStats = await CallLog.aggregate([
      { $match: { taskBatchId: batchObjectId } },
      {
        $group: {
          _id: null,
          totalCalls: { $sum: 1 },
          uniqueContacts: { $addToSet: "$contactId" },
        },
      },
      {
        $project: {
          totalCalls: 1,
          uniqueContacts: { $size: "$uniqueContacts" },
        },
      },
    ]);

    const calls = callStats[0] || {
      totalCalls: 0,
      uniqueContacts: 0,
    };

    /* ===============================
       RESPONSE
    =============================== */
    res.json({
      success: true,
      data: {
        tasks: taskSummary,
        calls,
        completionRate:
          taskSummary.total === 0
            ? 0
            : Math.round(
                (taskSummary.completed / taskSummary.total) * 100
              ),
      },
    });
  } catch (err) {
    console.error("BATCH OVERVIEW FAILED:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load batch overview",
    });
  }
};


export const dispositionContactAnalysis = async (req, res) => {
  const { batchId } = req.params;

  const taskIds = await Task.find({ taskBatchId: batchId })
    .distinct("_id");

  const data = await CallLog.aggregate([
    // 1️⃣ Only completed calls
    {
      $match: {
        taskId: { $in: taskIds },
        callEnd: { $ne: null },
        disposition: { $ne: null },
      },
    },

    // 2️⃣ Latest call per contact first
    {
      $sort: {
        contactId: 1,
        callEnd: -1,
      },
    },

    // 3️⃣ One record per contact
    {
      $group: {
        _id: "$contactId",
        disposition: { $first: "$disposition" },
      },
    },

    // 4️⃣ Count contacts by disposition
    {
      $group: {
        _id: "$disposition",
        count: { $sum: 1 },
      },
    },

    { $sort: { count: -1 } },
  ]);

  res.json({ success: true, data });
};


export const dispositionAttemptsAnalysis = async (req, res) => {
  const { batchId } = req.params;

  const taskIds = await Task.find({ taskBatchId: batchId })
    .distinct("_id");

  const data = await CallLog.aggregate([
    {
      $match: {
        taskId: { $in: taskIds },
      },
    },
    {
      $group: {
        _id: { $ifNull: ["$disposition", "N/A"] },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  res.json({
    success: true,
    data,
  });
};


export const dispositionCompletedAnalysis = async (req, res) => {
  const { batchId } = req.params;

  const taskIds = await Task.find({ taskBatchId: batchId })
    .distinct("_id");

  const data = await CallLog.aggregate([
    {
      $match: {
        taskId: { $in: taskIds },
        callEnd: { $ne: null },
        disposition: { $ne: null },
      },
    },
    {
      $group: {
        _id: "$disposition",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  res.json({
    success: true,
    data,
  });
};


export const agentPerformance = async (req, res) => {
  const { batchId } = req.params;

  const data = await CallLog.aggregate([
    {
      $lookup: {
        from: "tasks",
        localField: "taskId",
        foreignField: "_id",
        as: "task",
      },
    },
    { $unwind: "$task" },
    { $match: { "task.taskBatchId": batchId } },
    {
      $group: {
        _id: "$userId",
        totalCalls: { $sum: 1 },
        completedCalls: {
          $sum: { $cond: [{ $eq: ["$disposition", "connected"] }, 1, 0] },
        },
        avgDuration: { $avg: "$duration" },
      },
    },
  ]);

  res.json({ success: true, data });
};
export const callOutcomeAnalytics = async (req, res) => {
  const { batchId } = req.params;

  const taskIds = await Task.find({ taskBatchId: batchId })
    .distinct("_id");

  const rows = await CallLog.find({
    taskId: { $in: taskIds },
    callOutcome: { $exists: true },
  }).select("callEnd callOutcome disposition userId duration");

  res.json({
    success: true,
    data: rows,
  });
};
