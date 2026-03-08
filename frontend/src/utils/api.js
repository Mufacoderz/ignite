import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('df_token');
      localStorage.removeItem('df_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
