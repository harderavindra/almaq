import React, { useState } from 'react';
import axios from '../../api/axios'; // Your configured axios instance for backend
import axiosDirect from 'axios'; // Direct axios for GCS PUT upload

const UploadComponent = ({ userId, currentProfilePic,onSuccess }) => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadedUrl('');
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {

        const timestamp = Date.now();
        const folderPrefix = 'profile-pic/';
        const uniqueFileName = `${folderPrefix}${timestamp}-${file.name}`;
    
        const response = await axios.get('/signed-url', {
          params: {
            type: 'upload',
            fileName: uniqueFileName,
            contentType: file.type,
          },
        });
    
        const { signedUrl, fileUrl } = response.data;

      // Step 2: Upload to GCS
      await axiosDirect.put(signedUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        },
      });

      setUploadedUrl(fileUrl);

        // Step 3: Update profilePic for specific user
    await axios.put('/auth/update-profile-pic', {
        userId,            // from props
        profilePic: fileUrl,
      });
      if (onSuccess) onSuccess();
  
      alert('Profile picture uploaded and updated!');

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed!');
    }
  };

  const handleDeleteProfilePic = async () => {
      try {
        const filePath = currentProfilePic; // The file path in GCS
    
        const response = await axios.post('/auth/delete-file', { filePath, userId });
        if (onSuccess) onSuccess();
        alert(response.data.message); // Success message
        // Optionally update frontend user state here to reflect changes
       
    
      } catch (error) {
        console.error('Error deleting file:', error);
        alert('Failed to delete file!');
      }
    };

  return (
    <div style={{ padding: '1rem', maxWidth: '400px' }}>
      <h3>Upload File</h3>
      <button onClick={handleDeleteProfilePic}>Delete2</button>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file} style={{ marginTop: '10px' }}>
        Upload
      </button>

      {progress > 0 && (
        <div style={{ marginTop: '10px' }}>
          <progress value={progress} max="100" style={{ width: '100%' }} />
          <div>{progress}%</div>
        </div>
      )}

      {uploadedUrl && (
        <div style={{ marginTop: '10px' }}>
          <strong>Upload complete:</strong>
          <br />
          <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">
            View File
          </a>
        </div>
      )}
    </div>
  );
};

export default UploadComponent;
