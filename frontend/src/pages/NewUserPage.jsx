import { useState } from 'react';
import axios from '../api/axios'; // For your API
import axiosDirect from 'axios';  // For direct GCS upload

const NewUserPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [profilePic, setProfilePic] = useState(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProfilePic(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setProgress(0);

    let profilePicUrl = '';

    try {
      if (profilePic) {
        const timestamp = Date.now();
        const folderPrefix = 'profile-pic/';
        const uniqueFileName = `${folderPrefix}${timestamp}-${profilePic.name}`;

        // Step 1: Get Signed URL
        const res = await axios.get('/signed-url', {
          params: {
            type: 'upload',
            fileName: uniqueFileName,
            contentType: profilePic.type,
          },
        });

        const { signedUrl, fileUrl } = res.data;

        // Step 2: Upload directly to GCS
        await axiosDirect.put(signedUrl, profilePic, {
          headers: { 'Content-Type': profilePic.type },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          },
        });

        profilePicUrl = fileUrl;
      }

      // Step 3: Submit the form with image URL
      const payload = {
        ...form,
        profilePic: profilePicUrl,
      };

      await axios.post('/auth/register', payload);
      setMessage('User added successfully!');
      setForm({ name: '', email: '', password: '', role: 'user' });
      setProfilePic(null);
      setProgress(0);
    } catch (err) {
      console.error(err);
      setMessage('Failed to add user');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
      <input name="password" value={form.password} onChange={handleChange} type="password" placeholder="Password" required />
      <select name="role" value={form.role} onChange={handleChange}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <input type="file" name="profilePic" onChange={handleFileChange} accept="image/*" />
      {progress > 0 && <p>Uploading: {progress}%</p>}
      <button type="submit">Add User</button>
      <p>{message}</p>
    </form>
  );
};

export default NewUserPage;
