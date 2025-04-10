import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user, logout, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!user) return <p>User not logged in</p>;

  return (
    <div>
      <h1>Welcome, {user.name} 👋</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>

      {/* Add more user-specific data here */}
    </div>
  );
};

export default DashboardPage;