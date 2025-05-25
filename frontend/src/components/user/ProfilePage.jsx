import React, { useEffect, useState } from 'react';
import Avatar from '../common/Avatar';
import axios from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import UploadComponent from '../common/Upload';
import { useNavigate, useParams } from 'react-router-dom';
import SelectDropdown from '../common/SelectDropdown';
import InputText from '../common/InputText';
import Button from '../common/Button';
import { FiCheck, FiPenTool } from 'react-icons/fi';

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Manager', value: 'manager' },
  { label: 'Operator', value: 'operator' },
  { label: 'Delivery Manager', value: 'delivery_manager' },
  { label: 'Viewer', value: 'viewer' },
];
const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

const ProfilePage = ({ userId, onUserUpdated , onClose}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState('');
  const [updateData, setUpdateData] = useState({});
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const ViewText = ({ children, label }) => (
    <div className='flex flex-col gap-1'>
      <label className='text-gray-400'>{label}</label>
      <p className='text-xl capitalize'>{children}</p>
    </div>
  );

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/auth/users/${userId}`);
      setUser(data);
    } catch (error) {
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      
      await axios.put(`/auth/users/${userId}`, updateData);
      showToast('Profile updated!', 'success');
      setEditing('');
      setUpdateData({});
      if (onUserUpdated) onUserUpdated();
      fetchProfile();
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
      navigate('/users');
    } catch (err) {
      console.error('Delete user error:', err);
      showToast('Failed to delete user', 'error');
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!user) return <p className="text-center">No user data found.</p>;

  return (
    <div >
      <div className="flex flex-col items-center mb-6">
        <Avatar src={user.profilePic} size="lg" name={user.name} />
        <UploadComponent userId={user._id} currentProfilePic={user.profilePic} onSuccess={fetchProfile} />
        <h2 className="text-xl font-semibold mt-4">{user.firstName} {user.lastName}</h2>
        <p className="text-gray-500">{user.email}</p>
      </div>

      <div className="space-y-4 px-10">
        {/* Gender */}
        <div className="flex justify-between items-end gap-3">
          {editing === 'gender' ? (
            <>
              <SelectDropdown
                label="Gender"
                value={updateData.gender !== undefined ? updateData.gender : user.gender}
                onChange={(e) => setUpdateData((prev) => ({ ...prev, gender: e.target.value }))}
                options={genderOptions}
                placeholder="Select a gender"
                required
              />
              <Button width="auto" className="h-11"  onClick={handleUpdate}>
                <FiCheck />
              </Button>
            </>
          ) : (
            <>
              <ViewText label="Gender">{user.gender}</ViewText>
              <Button width="auto" className="h-10" variant="outline" onClick={() => setEditing('gender')}>
                <FiPenTool />
              </Button>
            </>
          )}
        </div>

        {/* First Name */}
        <div className="flex justify-between items-end gap-3">
          {editing === 'firstName' ? (
            <>
              <InputText
                type="text"
                name="firstName"
                label="First Name"
                placeholder="First Name"
                value={updateData.firstName !== undefined ? updateData.firstName : user.firstName}
                handleOnChange={handleInputChange}
              />
              <Button width="auto" className="h-11 "  onClick={handleUpdate}>
                <FiCheck />
              </Button>
            </>
          ) : (
            <>
              <ViewText label="First Name">{user.firstName}</ViewText>
              <Button width="auto" className="h-10" variant="outline" onClick={() => setEditing('firstName')}>
                <FiPenTool />
              </Button>
            </>
          )}
        </div>
        <div className="flex justify-between items-end gap-3">
          {editing === 'lastName' ? (
            <>
              <InputText
                type="text"
                name="lastName"
                label="Last Name"
                placeholder="Last Name"
                value={updateData.lastName !== undefined ? updateData.lastName : user.lastName}
                handleOnChange={handleInputChange}
              />
              <Button width="auto" className="h-11 "  onClick={handleUpdate}>
                <FiCheck />
              </Button>
            </>
          ) : (
            <>
              <ViewText label="Last Name">{user.lastName}</ViewText>
              <Button width="auto" className="h-10" variant="outline" onClick={() => setEditing('lastName')}>
                <FiPenTool />
              </Button>
            </>
          )}
        </div>


       

       <div className="flex justify-between items-end gap-3">
          {editing === 'role' ? (
            <>
              <SelectDropdown
                label="Role"
                value={updateData.role !== undefined ? updateData.role : user.role}
                onChange={(e) => setUpdateData((prev) => ({ ...prev, role: e.target.value }))}
                options={roleOptions}
                placeholder="Select a role"
                required
              />
              <Button width="auto" className="h-11 " onClick={handleUpdate}>
                <FiCheck />
              </Button>
            </>
          ) : (
            <>
              <ViewText label="Role">{user.role}</ViewText>
              <Button width="auto" className="h-10" variant="outline" onClick={() => setEditing('role')}>
                <FiPenTool />
              </Button>
            </>
          )}
        </div>

       
       <div className="flex justify-between items-end gap-3">
        <Button variant='danger' onClick={handleDelete} >
          Delete Profile
        </Button>
        <Button onClick={onClose} >
          Cancel
        </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
