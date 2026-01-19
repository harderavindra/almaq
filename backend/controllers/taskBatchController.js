import Task from "../models/Task.js";
import TaskBatch from "../models/TaskBatch.js";

import sanitizeHtml from "sanitize-html";


const defaultForm = {
  version: 1,
  fields: [
    {
      key: "interested",
      label: "Is user interested?",
      type: "boolean",
      required: true,
    },
    {
      key: "demoScheduledAt",
      label: "Demo Time",
      type: "datetime",
      visibleWhen: {
        field: "interested",
        equals: true,
      },
    },
    {
      key: "followUpRequired",
      label: "Follow-up Required?",
      type: "boolean",
    },
    {
      key: "followUpAt",
      label: "Follow-up Date",
      type: "datetime",
      visibleWhen: {
        field: "followUpRequired",
        equals: true,
      },
    },
    {
      key: "remarks",
      label: "Additional Comments",
      type: "textarea",
    },
  ],
};


function validateCallOutcomeForm(form) {
  if (!form || !Array.isArray(form.fields)) {
    throw new Error("Invalid call outcome form");
  }

  form.fields.forEach(field => {
    if (!field.key || !field.label || !field.type) {
      throw new Error("Each call outcome field must have key, label, and type");
    }

    const allowedTypes = [
      "boolean",
      "datetime",
      "text",
      "textarea",
      "select",
    ];

    if (!allowedTypes.includes(field.type)) {
      throw new Error(`Invalid field type: ${field.type}`);
    }

    if (field.type !== "select" && field.options?.length) {
      throw new Error("Options allowed only for select fields");
    }
  });
}
export const createTaskBatch = async (req, res) => {
  try {
    const {
      name,
      priority = "medium",
      purposeAndObjective = {},
      taskConfig = {},
      contacts = [],
      assignedUsers = [],
      callOutcomeForm = null
    } = req.body;

    if (!name) throw new Error("Batch name required");
    if (!purposeAndObjective.summary)
      throw new Error("Objective summary required");
    if (!contacts.length || !assignedUsers.length)
      throw new Error("Contacts and agents required");

    /* =====================
       SANITIZE CMS CONTENT
    ===================== */
    const cleanSummary = sanitizeHtml(purposeAndObjective.summary, {
      allowedTags: ["b", "i", "u", "ul", "ol", "li", "p", "a"],
      allowedAttributes: { a: ["href", "target"] },
    });

    const cleanAgentGoal = sanitizeHtml(
      purposeAndObjective.agentGoal || "",
      {
        allowedTags: ["b", "i", "u", "ul", "ol", "li", "p"],
      }
    );

    /* =====================
       CREATE BATCH
    ===================== */
    const batch = await TaskBatch.create({
      name,
      priority,
      createdBy: req.user._id,
      status: "draft",
      callOutcomeForm: callOutcomeForm || defaultForm,

      purposeAndObjective: {
        title: purposeAndObjective.title || name,
        summary: cleanSummary,
        agentGoal: cleanAgentGoal,
        doAndDonts: {
          do: (purposeAndObjective.doAndDonts?.do || []).filter(Boolean),
          dont: (purposeAndObjective.doAndDonts?.dont || []).filter(Boolean),
        },
        contentMeta: {
          version: 1,
          lastUpdatedBy: req.user._id,
          lastUpdatedAt: new Date(),
        },
      },

      progress: {
        pending: 0,
        inProgress: 0,
        completed: 0,
        failed: 0,
      },
    });

    /* =====================
       CREATE TASKS
    ===================== */
    const tasks = contacts.map((contactId, index) => ({
      taskBatchId: batch._id,
      contactId,
      assignedTo: assignedUsers[index % assignedUsers.length],
      taskType: taskConfig.taskType || "call",
      dueAt: taskConfig.dueAt,
      priority,
      status: "pending",
    }));

    await Task.insertMany(tasks);

    /* =====================
       UPDATE PROGRESS
    ===================== */
    await TaskBatch.findByIdAndUpdate(batch._id, {
      $set: { status: "queued" },
      $inc: { "progress.pending": tasks.length },
    });

    res.status(201).json({
      success: true,
      batchId: batch._id,
    });
  } catch (err) {
    console.error("CREATE TASK BATCH FAILED:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};



export const getTaskBatches = async (req, res) => {
  const { status } = req.query;

  const matchStage = {
    createdBy: req.user._id,
  };

  if (status) {
    matchStage.status = status;
  }

  const batches = await TaskBatch.aggregate([
    /* 1. Filter batches */
    { $match: matchStage },

    /* 2. Sort latest first */
    { $sort: { createdAt: -1 } },

    /* 3. Lookup tasks for each batch */
    {
      $lookup: {
        from: "tasks",
        localField: "_id",
        foreignField: "taskBatchId",
        as: "tasks",
      },
    },

    /* 4. Extract unique assignedTo user IDs */
    {
      $addFields: {
        assignedUserIds: {
          $setUnion: ["$tasks.assignedTo", []],
        },
      },
    },

    /* 5. Lookup user details */
    {
      $lookup: {
        from: "users",
        localField: "assignedUserIds",
        foreignField: "_id",
        as: "assignedUsers",
        pipeline: [
          {
            $project: {
              firstName: 1,
              lastName: 1,
              email: 1,
              profilePic: 1,
            },
          },
        ],
      },
    },

    /* 6. Populate createdBy */
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
        pipeline: [
          {
            $project: {
              firstName: 1,
              lastName: 1,
              email: 1,
              profilePic: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$createdBy" },

    /* 7. Cleanup payload */
    {
      $project: {
        tasks: 0,
        assignedUserIds: 0,
      },
    },
  ]);

  res.json({ success: true, data: batches });
};



export const getTaskBatchById = async (req, res) => {
  const batch = await TaskBatch.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
  }).populate("createdBy", "firstName lastName email profilePic");

  if (!batch) {
    return res.status(404).json({
      success: false,
      message: "Task batch not found",
    });
  }

  res.json({ success: true, data: batch });
};


export const deleteTaskBatch = async (req, res) => {
  const batch = await TaskBatch.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
  });

  if (!batch) {
    return res.status(404).json({
      success: false,
      message: "Task batch not found",
    });
  }

  await Task.deleteMany({ taskBatchId: batch._id });
  await TaskBatch.deleteOne({ _id: batch._id });

  res.json({
    success: true,
    message: "Task batch and associated tasks deleted",
  });
};


export const updateTaskBatch = async (req, res) => {
  const { name, purpose, status } = req.body;

  const batch = await TaskBatch.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user._id },
    { name, purpose, status },
    { new: true }
  );

  if (!batch) {
    return res.status(404).json({
      success: false,
      message: "Task batch not found",
    });
  }

  res.json({ success: true, data: batch });
};
