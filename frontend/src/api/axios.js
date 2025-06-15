import axios from 'axios';

const base = import.meta.env.VITE_API_BASE_URL || '';
const instance = axios.create({
  baseURL: `${base}api`,
  withCredentials: true,
});

let isRefreshing = false;

instance.interceptors.response.use(
  res => res,
  async err => {
    const originalConfig = err.config;

    // Skip refresh loop
    if (
      err.response?.status === 401 &&
      !originalConfig._retry &&
      !originalConfig.url.includes('/auth/refresh')
    ) {
      originalConfig._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          await instance.post('/auth/refresh');
          isRefreshing = false;
          return instance(originalConfig);
        }
      } catch (_err) {
        isRefreshing = false;

        // ✅ Redirect to login with session expired message
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?session=expired';
        }

        return Promise.reject(_err);
      }
    }

    return Promise.reject(err);
  }
);

export default instance;
