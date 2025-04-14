import UploadComponent from '../components/common/Upload';
import AvatarChange from '../components/user/AvatarChange';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user, logout, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!user) return <p>User not logged in</p>;
  const profilePicUrl = user.profilePic
    ? `${import.meta.env.VITE_API_BASE_URL}${user.profilePic}`  // Assuming user.profilePic stores the relative path
    : 'default-profile-pic-url';  // Default image if no profile pic

  return (
    <div>
      <h1>Welcome, {user.name} 👋</h1>
      <p>Email: {user.email}</p>
      <AvatarChange profilePic={profilePicUrl} size="md" />
      {/* <img src={profilePicUrl} alt="Profile" width="100" height="100" /> */}

      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
      <UploadComponent/>

      {/* Add more user-specific data here */}
    </div>
  );
};

export default DashboardPage;