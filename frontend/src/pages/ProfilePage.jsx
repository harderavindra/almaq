import React, { useEffect, useState } from 'react';
import Avatar from '../components/common/Avatar';
import axios from '../api/axios';
import { useToast } from '../context/ToastContext';
import UploadComponent from '../components/common/Upload';
import { useNavigate, useParams } from 'react-router-dom';

const ProfilePage = () => {
    const { userId } = useParams(); // Extract userId from URL
    const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchProfile = async () => {
    console.log(userId)
    try {
      setLoading(true);
      const { data } = await axios.get(`/auth/users/${userId}`);
      setUser(data);
      console.log(data.users)

    } catch (error) {
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      await axios.put('/auth/users/', user);
      showToast('Profile updated!', 'success');
      setEditing(false);
    } catch (err) {
      showToast('Failed to update profile', 'error');
    }
  };
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
  
    try {
      const filePath = user.profilePic;
  
      if (filePath) {
        await axios.post('/auth/delete-file', { filePath, userId });
      }
  
      await axios.delete(`/auth/users/${userId}`);
      showToast('User deleted successfully', 'success');
      navigate('/users'); // Redirect to home or login page
    } catch (err) {
      console.error('Delete user error:', err);
      showToast('Failed to delete user', 'error');
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (!user) return <p className="text-center">No user data found.</p>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">asd
      <div className="flex flex-col items-center mb-6">
        <Avatar src={user.profilePic} size="lg" name={user.name} />
              <UploadComponent userId={user._id} currentProfilePic={user.profilePic}   onSuccess={fetchProfile}/>
        
        <h2 className="text-xl font-semibold mt-4">{user.name}</h2>
        <p className="text-gray-500">{user.email}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block font-medium">Full Name</label>
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleInputChange}
            disabled={!editing}
            className="w-full border rounded px-4 py-2 mt-1 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={user.email}
            disabled
            className="w-full border rounded px-4 py-2 mt-1 bg-gray-100"
          />
        </div>

        {editing ? (
          <div className="flex justify-between mt-6">
            <button
              onClick={handleUpdate}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-gray-600 underline"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="text-right mt-6">
            <button
              onClick={() => setEditing(true)}
              className="text-blue-600 underline"
            >
              Edit Profile
            </button>
          </div>
        )}
         <button
    onClick={handleDelete}
    className="text-red-600 underline"
  >
    Delete Profile
  </button>
      </div>
    </div>
  );
};

export default ProfilePage;
