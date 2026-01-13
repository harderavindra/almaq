import TaskBatch from "../models/TaskBatch.js";

export const syncBatchProgress = async ({
  batchId,
  fromStatus,
  toStatus,
}) => {
  const inc = {};

  const map = {
    pending: "progress.pending",
    "in-progress": "progress.inProgress",
    completed: "progress.completed",
    cancelled: "progress.failed",
  };

  if (map[fromStatus]) inc[map[fromStatus]] = -1;
  if (map[toStatus]) inc[map[toStatus]] = 1;

  if (Object.keys(inc).length) {
    await TaskBatch.findByIdAndUpdate(batchId, { $inc: inc });
  }
};
