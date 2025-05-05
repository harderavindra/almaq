// src/components/Layout.js
import { Link, Outlet } from 'react-router-dom';
import Logo from '../../assets/almaq-logo.svg'
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
const AdminLayout = ({ children }) => {
  const { user, logout, loading } = useAuth();
  return (
    <div className='bg-gray-100 min-h-screen flex flex-col '>
      {/* Sidebar */}
      <div className='flex justify-between py-4 px-10'>
        <h2>
        <img src={Logo} height='40' alt='Logo' />
        </h2>
        <nav>
          <ul className='flex gap-6'>
            <li className='px-3'><Link to="/" >Dashboard</Link></li>
            <li className='px-3'><Link to="/new-user" >New User</Link></li>
            <li className='px-3'><Link to="/users" >Users</Link></li>
          </ul>
        </nav>
        <div className='flex gap-3'>
          <Avatar src={user.profilePic} />
          <div>
            <p className='leading-none capitalize font-semibold'>{user.name}</p>
            <p className='leading-none'>{user.email}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className=' ' >
        <main>{<Outlet />        }</main>
      </div>
    </div>
  );
};

export default AdminLayout;
