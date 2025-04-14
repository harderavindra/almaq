import UploadComponent from '../components/common/Upload';
import { useAuth } from '../context/AuthContext';
import axios from "../api/axios"
import { useState, useEffect } from 'react';
import Avatar from '../components/common/Avatar';
const DashboardPage = () => {
  const { user, logout, loading } = useAuth();
  const [signedProfilePicUrl, setSignedProfilePicUrl] = useState('');

  if (loading) return <p>Loading...</p>;

  if (!user) return <p>User not logged in</p>;

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (user?.profilePic) {
        try {
          const response = await axios.get('/signed-url', {
            params: {
              type: 'view',
              url: user.profilePic,  // full GCS URL saved in Mongo
            },
          });

          setSignedProfilePicUrl(response.data.signedUrl);
        } catch (error) {
          console.error('Failed to fetch signed profile pic URL:', error);
        }
      }
    };

    fetchSignedUrl();
  }, [user]);

  
  return (
    <div>
      <h1>Welcome, {user.name} 👋</h1>
      <p>Email: {user.email}</p>
      <Avatar src={signedProfilePicUrl} size="md" />
      {/* <img src={profilePicUrl} alt="Profile" width="100" height="100" /> */}

      <p>Role: {user.role} </p>
      <button onClick={logout}>Logout</button>
      <UploadComponent userId={user._id} currentProfilePic={user.profilePic}/>
      <button>Delete</button>

      {/* Add more user-specific data here */}
    </div>
  );
};

export default DashboardPage;