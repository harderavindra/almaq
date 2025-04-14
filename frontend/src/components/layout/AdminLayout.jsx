// src/components/Layout.js
import { Link, Outlet } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', background: '#2c3e50', color: 'white' }}>
        <h2 style={{ padding: '20px' }}>Admin Panel</h2>
        <nav>
          <ul style={{ listStyle: 'none', padding: '0' }}>
            <li><Link to="/" style={{ color: 'white', padding: '10px', display: 'block' }}>Dashboard</Link></li>
            <li><Link to="/new-user" style={{ color: 'white', padding: '10px', display: 'block' }}>New User</Link></li>
            <li><Link to="/users" style={{ color: 'white', padding: '10px', display: 'block' }}>Users</Link></li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '20px', background: '#ecf0f1' }}>
        <header>
          <h1>Welcome to Admin Panel</h1>
        </header>
        <main>{<Outlet />        }</main>
        <footer style={{ marginTop: '20px', textAlign: 'center' }}>Footer Content</footer>
      </div>
    </div>
  );
};

export default AdminLayout;
