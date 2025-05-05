import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/almaq-logo.svg'
import InputText from '../components/common/InputText';
import Button from '../components/common/Button';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/');

    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className='w-full flex justify-center items-center h-screen bg-gray-50'>
      <div className='flex flex-col gap-4'>
        <img src={Logo} height='40' width={'280'} alt='Logo' className='mb-10' />
        <form onSubmit={handleSubmit}>
          <div className='flex flex-col gap-4'>
            <InputText value={email} handleOnChange={e => setEmail(e.target.value)} placeholder="Email" autoComplete='username' />
            <InputText value={password} handleOnChange={e => setPassword(e.target.value)} type="password" placeholder="Password" autoComplete='current-password' />
            <Button type="submit" variant="primary" className='mt-4' width="auto">Login</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
