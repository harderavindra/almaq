// src/components/Layout.js
import { Link, NavLink, Outlet } from 'react-router-dom';
import Logo from '../../assets/almaq-logo.svg'
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
const AdminLayout = ({ children }) => {
  const { user, logout, loading } = useAuth();
  return (
    <div className='bg-gray-100 min-h-screen  flex flex-col '>
      {/* Sidebar */}
      <div className='flex justify-between items-center py-4 px-10'>
        <h2>
        <img src={Logo} height='40' alt='Logo' />
        </h2>
        <nav>
          <ul className='flex gap-2'>
            <li className='px-3'><NavLink to="/" className={({ isActive }) =>`${isActive ? 'bg-blue-500 text-white  rounded-full ':'' } px-4 py-2 `} >Dashboard</NavLink></li>
            <li className='px-3'><NavLink to="/orders" className={({ isActive }) =>`${isActive ? 'bg-blue-500 text-white  rounded-full ':'' } px-4 py-2`} >Orders</NavLink></li>
            <li className='px-3'><NavLink to="/challans" className={({ isActive }) =>`${isActive ? 'bg-blue-500 text-white  rounded-full ':'' } px-4 py-2`} >Challans</NavLink></li>
            <li className='px-3'><NavLink to="/invoices" className={({ isActive }) =>`${isActive ? 'bg-blue-500 text-white  rounded-full ':'' } px-4 py-2`} >Invoice</NavLink></li>
            { user.role === 'admin' && (
            <li className='px-3'><NavLink to="/users" className={({ isActive }) =>`${isActive ? 'bg-blue-500 text-white  rounded-full ':'' } px-4 py-2`} >Users</NavLink></li>
            )}
            <li className='px-3'><NavLink to="/master" className={({ isActive }) =>`${isActive ? 'bg-blue-500 text-white  rounded-full ':'' }  px-4 py-2`} >Master</NavLink></li>
          </ul>
        </nav>
        <div className='flex gap-3 items-center'>
          <div className='min-w-3'>
          <Avatar size='sm' src={user.profilePic} />
          </div>
          <div>
            <p className='leading-none capitalize font-semibold'>{user.firstName} {user.lastName}</p>
            <p className='leading-none'>{user.role}</p>
          </div>
          <button onClick={logout} className=' bg-white border border-gray-300 rounded-lg px-2 py-1 text-sm cursor-pointer' disabled={loading}>Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className=' px-10 min-h-screen' >
        <main >{<Outlet />        }</main>
      </div>
    </div>
  );
};

export default AdminLayout;
