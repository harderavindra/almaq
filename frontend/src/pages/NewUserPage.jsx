import { useState } from 'react';
import axios from '../api/axios';

const NewUserPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [profilePic, setProfilePic] = useState(null);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProfilePic(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('password', form.password);
    formData.append('role', form.role);
    if (profilePic) formData.append('profilePic', profilePic);

    try {
      await axios.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('User added successfully!');
      setForm({ name: '', email: '', password: '', role: 'user' });
      setProfilePic(null);
    } catch (err) {
      setMessage('Failed to add user');
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
      <input name="password" value={form.password} onChange={handleChange} type="password" placeholder="Password" required />
      <select name="role" value={form.role} onChange={handleChange}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <input type="file" name="profilePic" onChange={handleFileChange} accept="image/*" />
      <button type="submit">Add User</button>
      <p>{message}</p>
    </form>
  );
};

export default NewUserPage;
