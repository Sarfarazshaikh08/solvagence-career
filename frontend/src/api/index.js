import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
});

// Attach JWT from localStorage
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('svg_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Auto-logout on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('svg_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────
export const authAPI = {
  login:           (data) => api.post('/auth/login', data),
  me:              ()     => api.get('/auth/me'),
  changePassword:  (data) => api.put('/auth/password', data),
};

// ── Settings ──────────────────────────────────────────────────────
export const settingsAPI = {
  get:       ()     => api.get('/settings'),
  getPublic: ()     => api.get('/settings/public'),
  update:    (data) => api.put('/settings', data),
  reset:     ()     => api.post('/settings/reset', { confirm: 'RESET' }),
};

// ── Jobs ──────────────────────────────────────────────────────────
export const jobsAPI = {
  getPublic:   (params) => api.get('/jobs', { params }),
  getOne:      (id)     => api.get(`/jobs/${id}`),
  adminGetAll: ()       => api.get('/jobs/admin/all'),
  create:      (data)   => api.post('/jobs', data),
  update:      (id, d)  => api.put(`/jobs/${id}`, d),
  remove:      (id)     => api.delete(`/jobs/${id}`),
};

// ── Applications ─────────────────────────────────────────────────
export const appsAPI = {
  submit:       (formData) => api.post('/applications', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  }),
  getAll:       (params) => api.get('/applications', { params }),
  getOne:       (id)     => api.get(`/applications/${id}`),
  stats:        ()       => api.get('/applications/admin/stats'),
  updateStatus: (id, s)  => api.patch(`/applications/${id}/status`, { status: s }),
  updateScore:  (id, d)  => api.patch(`/applications/${id}/credit-score`, d),
  updateNotes:  (id, n)  => api.patch(`/applications/${id}/notes`, { notes: n }),
  getResumeUrl: (id)     => api.get(`/applications/${id}/resume-url`),
  remove:       (id)     => api.delete(`/applications/${id}`),
};

// ── Subscribers ───────────────────────────────────────────────────
export const subsAPI = {
  subscribe:  (data)  => api.post('/subscribers', data),
  getAll:     (params)=> api.get('/subscribers', { params }),
  remove:     (id)    => api.delete(`/subscribers/${id}`),
};

export default api;
