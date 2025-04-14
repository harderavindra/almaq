import React, { useState } from 'react';
import axios from '../../api/axios'; // Your configured axios instance for backend
import axiosDirect from 'axios'; // Direct axios for GCS PUT upload

const UploadComponent = () => {
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
      // Step 1: Get signed URL from backend
      const response = await axios.post('/auth/get-upload-url', {
        fileName: file.name,
        contentType: file.type,
      });

      const { signedUrl, publicUrl } = response.data;

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

      setUploadedUrl(publicUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed!');
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '400px' }}>
      <h3>Upload File</h3>
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
