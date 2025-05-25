import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCheckSquare, FiClipboard, FiClock, FiPlus, FiThumbsUp, FiTrash2 } from 'react-icons/fi';
import api from '../../api/axios';
import { OrderStatusIcon } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { hasAccess } from '../../utils/permissions';
const statuses = ["Draft", "Submitted", "Approved", "Delivered", "Cancelled",];


const OrderSidebar = ({ activeStatus }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
   const canEdit = hasAccess(user?.role, ['admin', 'manager']);
    const canView = hasAccess(user?.role, ['viewer']);
    const [counts, setCounts] = useState({});
    const [highlighted, setHighlighted] = useState(activeStatus || '');

    useEffect(() => {
    const fetchStatusCounts = async () => {
      try {
        const response = await api.get('/orders/status-counts');
        setCounts(response.data);
        // Auto-highlight first status with count > 0 if none selected
        if (!activeStatus) {
          const firstValidStatus = statuses.find(status => response.data[status] > 0);
          if (firstValidStatus) {
            setHighlighted(firstValidStatus);
            navigate(`/orders?status=${firstValidStatus}`);
          }
        }
      } catch (error) {
        console.error('Failed to fetch status counts:', error);
      }
    };

    fetchStatusCounts();
  }, [activeStatus, navigate]);

  const handleClick = (status) => {
    navigate(`/orders?status=${status}`);
  };

  return (
    <div className="w-52 h-full p-4">
      <h3 className="text-lg font-bold mb-4">Order Status</h3>
      <ul className="space-y-2">
        {canEdit && (
      <li
           
              className={`cursor-pointer px-5 py-2 rounded-full flex gap-4 items-center ${activeStatus === "Add" ? "bg-blue-500 text-white" : "hover:bg-blue-100"}`}
            
            >
              <Link to="/add-order" className="flex gap-4 items-center">
              <FiPlus size={20} />
              Add Order
              </Link>
            </li>
        )}
        {statuses.map((status) => {
         
           const count = counts[status] || 0;
            const isDisabled = count === 0;
          const isActive = activeStatus === status ;
          return (
             <li
              key={status}
              className={`
                px-5 py-2 rounded-full flex justify-between items-center
                ${isDisabled ? 'cursor-not-allowed text-gray-400' : 'cursor-pointer hover:bg-blue-600 hover:text-white'}
                ${isActive ? 'bg-blue-500 text-white' : ''}
              `}
              onClick={() => !isDisabled && handleClick(status)}
            >
              <OrderStatusIcon status={status} size={20} color={``} />
              {status}
               <span className="text-sm font-bold">{count}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OrderSidebar;
