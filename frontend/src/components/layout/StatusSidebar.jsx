import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { hasAccess } from '../../utils/permissions';
import { OrderStatusIcon } from '../../utils/constants';

const StatusSidebar = ({
  statuses,
  endpoint,
  basePath,
  addPath,
  icon: DefaultIcon,
  getStatusIcon, // optional: dynamic icons per status
  allowedRoles = ['admin', 'manager'],
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [counts, setCounts] = useState({});
  const canAdd = hasAccess(user?.role, allowedRoles);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await api.get(endpoint);
        setCounts(res.data);

        const searchStatus = new URLSearchParams(location.search).get('status');
        if (!searchStatus && location.pathname === basePath) {
          const firstWithCount = statuses.find((s) => res.data[s] > 0);
          if (firstWithCount) {
            navigate(`${basePath}?status=${firstWithCount}`);
          }
        }
      } catch (err) {
        console.error(`Failed to fetch status counts from ${endpoint}:`, err);
      }
    };

    fetchCounts();
  }, [endpoint, basePath, location, navigate, statuses]);

  const handleClick = (status) => {
    navigate(`${basePath}?status=${status}`);
  };

  const activeStatus = new URLSearchParams(location.search).get('status');

  return (
    <div className="w-60 h-full py-10 sticky top-0">
      <ul className="space-y-2">
        {canAdd && addPath && (
          <li>
            <Link
              to={addPath}
              className="cursor-pointer px-5 py-2 mb-10 rounded-full flex gap-2 items-center justify-center bg-green-500 text-white hover:bg-green-600"
            >
              <FiPlus size={18} />
              Add New
            </Link>
          </li>
        )}

        {statuses.map((status) => {
          const count = counts[status] || 0;
          const isDisabled = count === 0;
          const isActive = activeStatus === status;

          return (
            <li
              key={status}
              onClick={() => !isDisabled && handleClick(status)}
              className={`
                px-5 py-2 rounded-full flex justify-between items-center
                ${isDisabled ? 'cursor-not-allowed text-gray-400' : 'cursor-pointer hover:bg-blue-600 hover:text-white'}
                ${isActive ? 'bg-blue-500 text-white' : ''}
              `}
            >
              <span className="flex gap-2 items-center">
                <OrderStatusIcon status={status} size={20} />
                {status}
              </span>
              <span className="text-sm font-bold">{count}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default StatusSidebar;
