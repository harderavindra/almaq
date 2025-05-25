// src/components/Layout.js
import { Link, NavLink, Outlet } from 'react-router-dom';
import Logo from '../../assets/almaq-logo.svg'
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
const PrintLayout = ({ children }) => {
  const { user, logout, loading } = useAuth();
  return (
    <div className=''>
      {/* Sidebar */}
      

      {/* Main Content */}
      <div className=' ' >
        <main>{<Outlet />        }</main>
      </div>
    </div>
  );
};

export default PrintLayout;
