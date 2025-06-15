import axios from 'axios';

const base = import.meta.env.VITE_API_BASE_URL || '';
const instance = axios.create({
  baseURL: `${base}api`,
  withCredentials: true,
});

instance.interceptors.response.use(
    res => res,
    async err => {
      const originalConfig = err.config;
  
      // Prevent infinite loop by skipping refresh endpoint itself
      if (
        err.response?.status === 401 &&
        !originalConfig._retry &&
        !originalConfig.url.includes('/auth/refresh')
      ) {
        originalConfig._retry = true;
        try {
          await instance.post('/auth/refresh');
          return instance(originalConfig);
        } catch (_err) {
          return Promise.reject(_err);
        }
      }
  
      return Promise.reject(err);
    }
  );

export default instance;
