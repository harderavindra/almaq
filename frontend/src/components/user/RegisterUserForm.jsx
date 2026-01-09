import React, { useState } from 'react';
import InputText from '../common/InputText';
import SelectDropdown from '../common/SelectDropdown';
import Button from '../common/Button';
import axios from '../../api/axios';
import { useToast } from '../../context/ToastContext';

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Manager', value: 'manager' },
  { label: 'Operator', value: 'operator' },
  { label: 'Delivery Manager', value: 'delivery_manager' },
  { label: 'Viewer', value: 'viewer' },
  { label: 'Agent', value: 'agent' },
];

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

const RegisterUserForm = ({ onRegisterSuccess }) => {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
    gender: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      await axios.post('/auth/register', formData);
      showToast('User registered successfully!', 'success');
      setFormData({ firstName: '',lastName:'', email: '', password: '', role: '', gender: '' });
      if (onRegisterSuccess) onRegisterSuccess();
    } catch (err) {
      console.error(err);
      showToast('Failed to register user.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <h2 className="text-xl font-bold mb-4">Register New User</h2>
    <form>
      <InputText
        label="First Name"
        name="firstName"
        value={formData.firstName}
        handleOnChange={handleChange}
        placeholder="First Name"
        required
      />
      <InputText
        label="Last Name"
        name="lastName"
        value={formData.lastName}
        handleOnChange={handleChange}
        placeholder="Last Name"
        required
      />

      <InputText
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        handleOnChange={handleChange}
        placeholder="Email Address"
        autoComplete={''}
        required
      />

      <InputText
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        handleOnChange={handleChange}
        placeholder="Create Password"
        required
      />

      <SelectDropdown
        label="Role"
        name="role"
        value={formData.role}
        onChange={handleChange}
        options={roleOptions}
        placeholder="Select Role"
        required
      />

      <SelectDropdown
        label="Gender"
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        options={genderOptions}
        placeholder="Select Gender"
        required
      />

      <Button onClick={handleRegister} disabled={loading} className="mt-4 w-full">
        {loading ? 'Registering...' : 'Register User'}
      </Button>
      </form>
    </div>
  );
};

export default RegisterUserForm;
