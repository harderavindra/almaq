import Task from "../models/Task.js";
import TaskBatch from "../models/TaskBatch.js";
import CallLog from "../models/CallLog.js";
import DispositionMaster from "../models/DispositionMaster.js";
import { syncBatchProgress } from "../utils/syncBatchProgress.js";

/* ======================================================
   GET ACTIVE DISPOSITIONS (FOR AGENT UI)
   GET /api/dispositions
====================================================== */
export const getActiveDispositions = async (req, res) => {
  try {
    const list = await DispositionMaster.find({ active: true })
      .sort({ order: 1 });

    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to load dispositions",
    });
  }
};

/* ======================================================
   START CALL
   POST /api/calls/start
====================================================== */
export const startCall = async (req, res) => {
  try {
    const { taskId, contactId, visitorId } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Create call log
    const callLog = await CallLog.create({
      taskId,
      contactId,
      visitorId: visitorId || null,
      userId: req.user._id,
      callStart: new Date(),
    });

    // Move task to in-progress if needed
    if (task.status !== "in-progress") {
      await syncBatchProgress({
        batchId: task.taskBatchId,
        fromStatus: task.status,
        toStatus: "in-progress",
      });

      task.status = "in-progress";
      await task.save();
    }

    res.json({
      success: true,
      data: {
        callLogId: callLog._id,
      },
    });
  } catch (err) {
    console.error("START CALL FAILED:", err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/* ======================================================
   END CALL + APPLY DISPOSITION
   POST /api/calls/end
====================================================== */
export const endCall = async (req, res) => {
  try {
    const {
      callLogId,
      dispositionCode,
      callOutcome = {},
      remarks,
      nextFollowUpAt,
    } = req.body;
console.log("ENDING CALL with req.body:", req.body);
    /* -----------------------------
       Validate Call Log
    ----------------------------- */
    const callLog = await CallLog.findById(callLogId);
    if (!callLog) {
      return res.status(404).json({
        success: false,
        message: "Call log not found",
      });
    }
    console.log("ENDING CALL LOG:", callOutcome);

    /* -----------------------------
       Validate Disposition
    ----------------------------- */
    const disposition = await DispositionMaster.findOne({
      code: dispositionCode,
      active: true,
    });

    console.log("ENDING CALL disposition:", disposition);
    if (!disposition) {
      return res.status(400).json({
        success: false,
        message: "Invalid disposition",
      });
    }

    /* -----------------------------
       Load Task & Batch
    ----------------------------- */
    const task = await Task.findById(callLog.taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
    console.log("ENDING CALL LOG:", callOutcome);

    const batch = await TaskBatch.findById(task.taskBatchId);

    

    /* =============================
       UPDATE CALL LOG
    ============================= */
    callLog.callEnd = new Date();
    callLog.duration = Math.floor(
      (callLog.callEnd - callLog.callStart) / 1000
    );
    callLog.disposition = disposition.code;
    callLog.callOutcome = callOutcome;
    callLog.remarks = remarks || "";

    await callLog.save();

    /* =============================
       APPLY DISPOSITION RULES
    ============================= */
    const previousStatus = task.status;

    if (disposition.incrementAttempt) {
      task.attemptCount += 1;
    }

    const maxAllowed =
      disposition.maxAttemptsAllowed ?? task.maxAttempts;

    if (
      disposition.incrementAttempt &&
      task.attemptCount >= maxAllowed
    ) {
      task.status = "cancelled";
    } else {
      task.status = disposition.taskStatus;
    }
    

    if (
      disposition.requiresFollowUpDate &&
      nextFollowUpAt
    ) {
      task.dueAt = nextFollowUpAt;
    }

    await task.save();

    /* =============================
       SYNC TASK BATCH PROGRESS
    ============================= */
    if (previousStatus !== task.status) {
      await syncBatchProgress({
        batchId: task.taskBatchId,
        fromStatus: previousStatus,
        toStatus: task.status,
      });
    }

    res.json({
      success: true,
      data: {
        task,
        callLog,
      },
    });
  } catch (err) {
    console.error("DISPOSITION FAILED:", err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};



export const getCallHistory = async (req, res) => {
  try {
    const { taskId } = req.params;
    console.log("FETCHING CALL HISTORY FOR TASK:", taskId);

    const logs = await CallLog.find({ taskId })
      .populate("userId", "firstName lastName mobile")
      .populate("contactId", "firstName lastName mobile")
      .sort({ callStart: -1 })
      .lean();

    res.json({
      success: true,
      data: logs,
    });
  } catch (err) {
    console.error("CALL HISTORY FAILED:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch call history",
    });
  }
};