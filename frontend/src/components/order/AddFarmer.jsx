import { useState } from 'react';
import api from '../../api/axios';
const AddFarmer = ({ onAdd, onCancel }) => {
  const [form, setForm] = useState({
    name: '',
    address: '',
    contactNumber: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name) return;

    setLoading(true);
    try {
      const res = await api.post('/farmers', form);
      console.log('Farmer created:', res.data);
      setForm({ name: '', address: '', contactNumber: '' }); // Reset form
      onAdd(res.data); // Pass new farmer to parent
    } catch (err) {
  console.error('Error creating farmer:', err);
  alert(err?.response?.data?.message || err.message || 'Error creating farmer');
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-farmer-modal">
      <h4>Add New Farmer</h4>
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
      <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
      <input name="contactNumber" placeholder="Contact Number" value={form.contactNumber} onChange={handleChange} />
      <div>
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button onClick={onCancel} disabled={loading}>Cancel</button>
      </div>
    </div>
  );
};

export default AddFarmer;
