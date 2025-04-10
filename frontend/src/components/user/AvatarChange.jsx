import { useState } from 'react';
import axios from '../../api/axios'; // Import your configured axios instance

const AvatarChange = ({ profilePic, size = 'md' }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('profilePic', selectedFile);

    try {
      const res = await axios.post('/auth/upload-profile-pic', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('Profile picture updated successfully!');
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setMessage('Failed to upload profile picture.');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axios.post('/auth/delete-profile-pic');
      setMessage('Profile picture deleted successfully!');
    } catch (err) {
      console.error('Error deleting profile picture:', err);
      setMessage('Failed to delete profile picture.');
    }
  };


  // Determine size classes based on the size prop
  const sizeClasses = {
    sm: { width: '50px', height: '50px' },
    md: { width: '100px', height: '100px' },
    lg: { width: '150px', height: '150px' },
  };

  const imageSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div>
      <h2>Profile Picture</h2>
      <div>
        <img
          src={profilePic || '/default-avatar.png'} // Default avatar if no profile pic
          alt="Profile"
          width={imageSize.width}
          height={imageSize.height}
        />
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ margin: '10px 0' }}
          />
          <button onClick={handleUpload}>Upload New Picture</button>
        </div>
        {profilePic && (
          <button onClick={handleDelete} style={{ marginTop: '10px' }}>
            Delete Profile Picture
          </button>
        )}
      </div>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AvatarChange;
