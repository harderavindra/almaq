import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckSquare, FiClipboard, FiClock, FiThumbsUp, FiTrash2 } from 'react-icons/fi';

const statuses = ["Draft", "Submitted", "Approved", "Delivered", "Cancelled"];
const statusIcons = {
  Draft: FiClipboard,
  Submitted: FiClock,
  Approved: FiCheckSquare,
  Delivered: FiThumbsUp,
  Cancelled: FiTrash2,
};

const OrderSidebar = ({ activeStatus }) => {
  const navigate = useNavigate();

  const handleClick = (status) => {
    navigate(`/orders?status=${status}`);
  };

  return (
    <div className="w-52 h-full p-4">
      <h3 className="text-lg font-bold mb-4">Order Status</h3>
      <ul className="space-y-2">
        {statuses.map((status) => {
          const Icon = statusIcons[status];
          return (
            <li
              key={status}
              className={`cursor-pointer px-5 py-2 rounded-full flex gap-4 items-center ${
                activeStatus === status ? "bg-blue-500 text-white" : "hover:bg-blue-100"
              }`}
              onClick={() => handleClick(status)}
            >
              <Icon size={20} />
              {status}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OrderSidebar;
