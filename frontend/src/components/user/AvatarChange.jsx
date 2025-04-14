import { useState } from 'react';
import axios from '../../api/axios';

const AvatarChange = ({ profilePic, size = 'md' }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState('');
    const [progress, setProgress] = useState(0);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        const fileName = `profile-pictures/${Date.now()}-${selectedFile.name}`;
        const fileType = selectedFile.type;

        if (!fileType.startsWith('image/')) {
            setMessage('❌ Please select a valid image file.');
            return;
        }

        try {
            const response = await axios.post('/auth/get-upload-url', {
                fileName,
                fileType,
            });

            const { signedUrl } = response.data;
            console.log( signedUrl, selectedFile.type)
            try {
                const uploadResponse = await axios.put(signedUrl, selectedFile, {
                    headers: {
                        'Content-Type': selectedFile.type,  // Set Content-Type to match the file type
                    },
                    onUploadProgress: (progressEvent) => {
                        const percent = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setProgress(percent);  // Update the progress (e.g., show a progress bar)
                    },
                });
            
                // Handle the upload completion
                console.log('File uploaded successfully:', uploadResponse);
            } catch (error) {
                console.error('Error during file upload:', error);
                // Optionally, display an error message to the user
            }

            // setUploadedImageUrl(fileUrl);
            setMessage('✅ Profile picture uploaded successfully!');

        } catch (error) {
            console.error('Upload Error:', error);

            if (error.response) {
                const serverMessage = error.response.data?.message || 'An error occurred on the server.';
                setMessage(`❌ ${serverMessage}`);
            } else if (error.request) {
                setMessage('❌ No response from the server. Please check your network connection.');
            } else {
                setMessage(`❌ ${error.message}`);
            }
        }
    };


    const handleDelete = async () => {
        try {
            await axios.post('/auth/delete-profile-pic');
            setMessage('✅ Profile picture deleted successfully!');
        } catch (err) {
            console.error('Error deleting profile picture:', err);
            setMessage('❌ Failed to delete profile picture.');
        }
    };

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
                    src={uploadedImageUrl || profilePic || '/default-avatar.png'}
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
            {progress > 0 && progress < 100 && <p>Uploading: {progress}%</p>}
            {message && <p>{message}</p>}
        </div>
    );
};

export default AvatarChange;
