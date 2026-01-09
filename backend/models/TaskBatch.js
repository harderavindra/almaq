import mongoose from "mongoose";

/* ======================================================
   HELPER: Normalize & Recalculate Totals
====================================================== */
function recalculateTotals(progress = {}) {
  const pending = progress.pending || 0;
  const inProgress = progress.inProgress || 0;
  const completed = progress.completed || 0;
  const failed = progress.failed || 0;

  return {
    progress: { pending, inProgress, completed, failed },
    totalTasks: pending + inProgress + completed + failed,
  };
}

/* ======================================================
   SCHEMA
====================================================== */
const taskBatchSchema = new mongoose.Schema(
  {
    /* ---------- Identity ---------- */
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["draft", "queued", "running", "paused", "completed", "failed"],
      default: "draft",
      index: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    /* ---------- Purpose & Objective (CMS-like) ---------- */
    purposeAndObjective: {
      title: String,
      summary: String,
      agentGoal: String,

      contentMeta: {
        version: { type: Number, default: 1 },
        lastUpdatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        lastUpdatedAt: Date,
      },
    },

    /* ---------- Progress & Volume ---------- */
    progress: {
      pending: { type: Number, default: 0 },
      inProgress: { type: Number, default: 0 },
      completed: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
    },

    totalTasks: {
      type: Number,
      default: 0,
    },

    /* ---------- Ownership ---------- */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

/* ======================================================
   PRE-SAVE (CREATE / doc.save)
   Ensures progress is initialized and totals are correct
====================================================== */
taskBatchSchema.pre("save", function (next) {
  const { progress, totalTasks } = recalculateTotals(this.progress);
  this.progress = progress;
  this.totalTasks = totalTasks;
  next();
});

/* ======================================================
   PRE-FINDONEANDUPDATE (PATCH / PUT / $inc / $set)
   MongoDB-safe, no conflicting operators
====================================================== */
taskBatchSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (!update) return next();

  const hasProgressInc = update.$inc && update.$inc.progress;
  const hasProgressSet = update.$set && update.$set.progress;

  // ❌ Never allow both $inc and $set on progress
  if (hasProgressInc && hasProgressSet) {
    return next(
      new Error("Cannot $inc and $set progress in the same update")
    );
  }

  /* ---------- Case 1: $inc progress ---------- */
  if (hasProgressInc) {
    const doc = await this.model.findOne(this.getQuery());
    if (!doc) return next();

    // Apply increments in-memory
    for (const key of Object.keys(update.$inc.progress)) {
      doc.progress[key] =
        (doc.progress[key] || 0) + update.$inc.progress[key];
    }

    // Recalculate totals
    const { totalTasks } = recalculateTotals(doc.progress);

    update.$set = {
      ...(update.$set || {}),
      totalTasks,
    };

    return next();
  }

  /* ---------- Case 2: $set full progress ---------- */
  if (hasProgressSet) {
    const { progress, totalTasks } = recalculateTotals(
      update.$set.progress
    );

    update.$set.progress = progress;
    update.$set.totalTasks = totalTasks;
  }

  next();
});

export default mongoose.model("TaskBatch", taskBatchSchema);
