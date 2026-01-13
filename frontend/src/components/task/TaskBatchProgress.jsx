const TaskBatchProgress = ({ progress = {}, totalTasks }) => (
  <div>
    <p>Calls / Tasks: {totalTasks}</p>
    <div className="flex gap-4 mt-3">
      <StatusBubble icon="clock" status="info" size="sm" />
      {progress.pending || 0}

      <StatusBubble icon="star" status="warning" size="sm" />
      {progress.inProgress || 0}

      <StatusBubble icon="rocket" status="success" size="sm" />
      {progress.completed || 0}

      <StatusBubble icon="reject" status="error" size="sm" />
      {progress.failed || 0}
    </div>
  </div>
);
export default TaskBatchProgress;