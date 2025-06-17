// components/OrderStatusTimelineItem.js
import React from 'react';
import { OrderStatusIcon } from '../../utils/constants';
import Avatar from './Avatar';
import { formatShortDateTime } from '../../utils/dateUtils';

const StatusTimelineItem = ({ status }) => {
  const isApproved = status.status === 'Approved';

  return (
    <div className="flex items-center gap-2 mb-2">
      <span className={`text-sm ml-2 font-medium ${isApproved ? 'text-green-600' : 'text-red-600'}`}>
        <OrderStatusIcon status={status.status} size="18" color="primary" />
      </span>
      <div className="flex items-center border border-blue-200 rounded-full pl-1 pr-3 py-1 gap-2">
        <Avatar src={status.updatedBy?.profilePic} alt={status.updatedBy?.firstName} size="xs" />
        <p className="text-sm capitalize">{status.updatedBy?.firstName}</p>
        <span className="text-xs text-gray-500">
          {formatShortDateTime(status.updatedAt)}
        </span>
      </div>
    </div>
  );
};

export default StatusTimelineItem;
