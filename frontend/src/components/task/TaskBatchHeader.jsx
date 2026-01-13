import { formatDateTime } from "../../utils/dateUtils";
import Avatar from "../common/Avatar";
import StatusBubbleText from "../common/StatusBubbleText";

const TaskBatchHeader = ({ batch }) => (
  <div className="space-y-2">
    <h2 className="text-2xl font-semibold">{batch.name}</h2>

    <div className="flex gap-4 items-center text-sm">
      <Avatar
        src={batch.createdBy?.profilePic}
        alt={batch.createdBy?.firstName}
        size="sm"
      />
      <div>
        <p className="font-medium">
          {batch.createdBy?.firstName} {batch.createdBy?.lastName}
        </p>
        <p>{formatDateTime(batch.createdAt)}</p>
      </div>
    </div>

    <div className="flex gap-3">
      <StatusBubbleText size="sm" text={batch.status} />
      <StatusBubbleText size="sm" text={batch.priority} />
    </div>
  </div>
);
export default TaskBatchHeader;