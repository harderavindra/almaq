import React, { useState } from 'react';
import axios from '../api/axios';
import axiosDirect from 'axios';         // for GCS PUT upload

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState('');

  const handelGetUrl = async (fileName) =>{
    console.log(fileName)
    try {
      // Step 1: Get signed URL from backend
      const response = await axios.post('/auth/getfileUrl', {
        fileName
      });
    }catch (error) {
      console.error('get url failed:', error);
    }
  }
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      // Step 1: Get signed URL from backend
      const response = await axios.post('/auth/get-upload-url', {
        fileName: file.name,
        contentType: file.type
      });

      const { signedUrl } = response.data;

      await axiosDirect.put(signedUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        },
      });


   

      console.log('Upload successful:', signedUrl);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      <h2>Upload File to Google Cloud Storage</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file}>
        Upload
      </button>
      
      {progress > 0 && (
        <div>
          <progress value={progress} max="100" />
          <span> {progress}%</span>
        </div>
      )}
      
      {uploadedFileUrl && (
        <div>
          <p>Upload complete!</p>
          <a href={uploadedFileUrl} target="_blank" rel="noopener noreferrer">
            View uploaded file
          </a>
        </div>
      )}
      <button onClick={()=>handelGetUrl('DSC_0494-scaled.jpg')}>Get URL</button>
    </div>
  );
};

export default FileUpload;