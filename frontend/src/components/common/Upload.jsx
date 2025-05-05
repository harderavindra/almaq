import React, { useState, useRef, useEffect } from 'react';
import { FiCamera } from 'react-icons/fi';
import axios from '../../api/axios';
import axiosDirect from 'axios';

const UploadComponent = ({ userId, currentProfilePic, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadedUrl('');
    setProgress(0);
  };

  useEffect(() => {
    if (file) {
      handleUpload();
    }
  }, [file]);

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

      await axios.put('/auth/update-profile-pic', {
        userId,
        profilePic: fileUrl,
      });

      if (onSuccess) onSuccess();

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed!');
    }
  };

  const handleDeleteProfilePic = async () => {
    try {
      const filePath = currentProfilePic;

      const response = await axios.post('/auth/delete-file', { filePath, userId });
      if (onSuccess) onSuccess();
      alert(response.data.message);
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file!');
    }
  };

  return (
    <div className="text-center mt-4">
      {currentProfilePic && (
        <button
          onClick={handleDeleteProfilePic}
          className="text-red-600 underline mb-3 block"
        >
          Delete Profile Picture
        </button>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />

      {/* Upload button */}
      <button
        onClick={() => fileInputRef.current.click()}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mx-auto"
      >
        <FiCamera className="w-5 h-5" />
        Upload Image
      </button>

      {progress > 0 && (
        <div className="mt-4">
          <progress value={progress} max="100" className="w-full" />
          <div>{progress}%</div>
        </div>
      )}
    </div>
  );
};

export default UploadComponent;
