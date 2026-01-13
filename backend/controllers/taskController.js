import Task from "../models/Task.js";
import TaskBatch from "../models/TaskBatch.js";
import CallLog from "../models/CallLog.js";


export const getTasks = async (req, res) => {
  const filter = {};

  if (req.query.taskBatchId) {
    filter.taskBatchId = req.query.taskBatchId;
  }
  console.log("Filter in getTasks:", filter);

  const tasks = await Task.find(filter)
    .populate("contactId")
    .populate("assignedTo")
    .sort({ dueAt: 1 });

  const taskIds = tasks.map(t => t._id);

  const lastCalls = await CallLog.aggregate([
    { $match: { taskId: { $in: taskIds } } },
    { $sort: { callEnd: -1 } },
    {
      $group: {
        _id: "$taskId",
        disposition: { $first: "$disposition" },
        remarks: { $first: "$remarks" },
        callEnd: { $first: "$callEnd" },
        duration: { $first: "$duration" },
      },
    },
  ]);

  const callMap = {};
  lastCalls.forEach(c => {
    callMap[c._id.toString()] = c;
  });

  const enrichedTasks = tasks.map(t => ({
    ...t,
    lastCall: callMap[t._id.toString()] || null,
  }));

  console.log("Filter in getTasks:", enrichedTasks);
  res.json({ success: true, data: enrichedTasks });
};


/* ======================================================
   GET AGENT TASK QUEUE
   GET /api/tasks/my
====================================================== */
export const getMyTasks = async (req, res) => {
  const tasks = await Task.find({
    assignedTo: req.user._id,
    status: { $in: ["pending", "in-progress"] },
  })
    .populate("contactId")
    .populate("visitorId")
    .sort({ priority: -1, dueAt: 1 });

  res.json({ success: true, data: tasks });
};

/* ======================================================
   UPDATE TASK STATUS
   PATCH /api/tasks/:id/status
====================================================== */
export const updateTaskStatus = async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );

  res.json({ success: true, data: task });
};

/* ======================================================
   START CALL
   POST /api/calls/start
====================================================== */
export const startCall = async (req, res) => {
  try {
    const log = await CallLog.create({
      taskId: req.body.taskId,
      contactId: req.body.contactId,
      visitorId: req.body.visitorId || null,
      userId: req.user._id,
      callStart: new Date(),
    });

    await Task.findByIdAndUpdate(req.body.taskId, {
      status: "in-progress",
    });

    res.json({ success: true, data: log });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

/* ======================================================
   END CALL + DISPOSITION LOGIC
   POST /api/calls/end
====================================================== */
export const endCall = async (req, res) => {
  try {
    const { callLogId, disposition, remarks, nextFollowUpAt } = req.body;

    const callLog = await CallLog.findById(callLogId);
    if (!callLog) {
      return res.status(404).json({ success: false, message: "Call log not found" });
    }

    callLog.callEnd = new Date();
    callLog.duration = Math.floor(
      (callLog.callEnd - callLog.callStart) / 1000
    );
    callLog.disposition = disposition;
    callLog.remarks = remarks;
    await callLog.save();

    const task = await Task.findById(callLog.taskId);

    /* -------- AUTO DISPOSITION RULES -------- */

    // Final dispositions
    if (
      ["connected", "not-interested", "wrong-number", "dnd"].includes(disposition)
    ) {
      task.status = "completed";
    }

    // Retry dispositions
    if (["callback", "no-answer", "busy"].includes(disposition)) {
      task.attemptCount += 1;

      if (task.attemptCount >= task.maxAttempts) {
        task.status = "cancelled";
      } else {
        task.status = "pending";
        if (nextFollowUpAt) {
          task.dueAt = nextFollowUpAt;
        }
      }
    }

    await task.save();

    res.json({
      success: true,
      data: {
        task,
        callLog,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
