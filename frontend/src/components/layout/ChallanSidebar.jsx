import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiPlus, FiTruck } from 'react-icons/fi';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { hasAccess } from '../../utils/permissions';

const challanStatuses = ['Draft', 'Issued', 'Delivered', 'Cancelled'];

const ChallanSidebar = ({ activeStatus }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const canAdd = hasAccess(user?.role, ['admin', 'manager']);
  const [counts, setCounts] = useState({});
  const [highlighted, setHighlighted] = useState(activeStatus || '');

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await api.get('/challans/status-counts');
        setCounts(res.data);

        // Auto-highlight
         if (!activeStatus && location.pathname === '/challans') {
          const firstWithCount = challanStatuses.find(s => res.data[s] > 0);
          if (firstWithCount) {
            setHighlighted(firstWithCount);
            navigate(`/challans?status=${firstWithCount}`);
          }
        }
      } catch (err) {
        console.error('Failed to fetch challan status counts:', err);
      }
    };

    fetchCounts();
  }, [activeStatus, navigate]);

  const handleClick = (status) => {
    navigate(`/challans?status=${status}`);
  };

  return (
    <div className="w-52 h-full p-4">
      <h3 className="text-lg font-bold mb-4">Challan Status</h3>
      <ul className="space-y-2">
        {canAdd && (
          <li>
            <Link
              to="/add-challan"
              className="cursor-pointer px-5 py-2 rounded-full flex gap-4 items-center hover:bg-blue-100"
            >
              <FiPlus />
              Add Challan
            </Link>
          </li>
        )}
        {challanStatuses.map((status) => {
          const count = counts[status] || 0;
          const isDisabled = count === 0;
          const isActive = new URLSearchParams(location.search).get('status') === status;

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
                <FiTruck />
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

export default ChallanSidebar;
