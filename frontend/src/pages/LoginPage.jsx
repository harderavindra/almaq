import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/almaq-logo.svg';
import InputText from '../components/common/InputText';
import Button from '../components/common/Button';
import { FiAlertCircle, FiEye, FiEyeOff, FiWifiOff } from 'react-icons/fi';

const LoginPage = () => {
  const { login,isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
    if (isAuthenticated) {
      // Redirect authenticated users to dashboard or homepage
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Auto-hide password after 3 seconds
  useEffect(() => {
    if (!showPassword) return;
    const timer = setTimeout(() => setShowPassword(false), 3000);
    return () => clearTimeout(timer);
  }, [showPassword]);

  // Detect online/offline status
  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!navigator.onLine) {
      setError('You are offline. Please check your internet connection.');
      return;
    }

   setIsLoading(true); // Start loading

    const result = await login({ email, password });
      setIsLoading(false); // Stop loading


    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate('/');
  };

  return (
    <div className='w-full flex justify-center items-center h-screen bg-gray-50'>
      <div className='flex flex-col gap-4 w-80'>
        <img src={Logo} height='40' width='280' alt='Logo' className='mb-10 self-center' />

        {!isOnline && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-sm flex items-center justify-center gap-2">
            <FiWifiOff size={24} />
            You are currently offline.
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-sm flex items-center gap-2">
            {error.includes('offline') ? <FiWifiOff /> : <FiAlertCircle />}
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputText
            value={email}
            handleOnChange={e => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete='username'
          />

          <div className='relative'>
            <InputText
              value={password}
              handleOnChange={e => setPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              autoComplete='current-password'
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 bottom-2 w-6 h-6 flex justify-center items-center text-gray-600"
              onClick={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>

          <Button type="submit" variant="primary" className='mt-4' width="auto"   disabled={!isOnline || isLoading}
>
  {isLoading ? 'Logging in...' : isOnline ? 'Login' : 'Offline'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
