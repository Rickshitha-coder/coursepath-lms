import axios from 'axios';

// Real HTTP client — talks to the same Express/Sequelize/JWT backend the
// vanilla frontend uses (no mock data). In dev, Vite proxies '/api' to
// http://localhost:5000 (see vite.config.js); in production, serve this
// build from the same Express app and '/api' resolves automatically.
const api = axios.create({ baseURL: '/api' });

// Attach the JWT (if present) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Centralized handling: on a 401 (missing/expired/invalid token), clear the
// stale session so the UI drops back to a logged-out state instead of
// looping on failed requests.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('cp_token');
      localStorage.removeItem('cp_user');
    }
    return Promise.reject(err);
  }
);

export default api;
