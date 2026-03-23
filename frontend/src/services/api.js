import axios from 'axios';

const API_BASE = process.env.NODE_ENV === 'production'
    ? '/api'
    : 'http://localhost:5000/api';


const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: handle 401 globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ── Auth ───────────────────────────────────────────────────────
export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');

// ── Faculty ───────────────────────────────────────────────────
export const getFaculty = (params = {}) => api.get('/faculty', { params });
export const getFacultyById = (id) => api.get(`/faculty/${id}`);
export const createFaculty = (data) => api.post('/faculty', data);
export const updateFaculty = (id, data) => api.put(`/faculty/${id}`, data);
export const deleteFaculty = (id) => api.delete(`/faculty/${id}`);

// ── Subjects ─────────────────────────────────────────────────
export const getSubjects = (params = {}) => api.get('/subjects', { params });
export const getSubjectById = (id) => api.get(`/subjects/${id}`);
export const createSubject = (data) => api.post('/subjects', data);
export const updateSubject = (id, data) => api.put(`/subjects/${id}`, data);
export const deleteSubject = (id) => api.delete(`/subjects/${id}`);

// ── Batches ─────────────────────────────────────────────────
export const getBatches = (params = {}) => api.get('/batches', { params });
export const seedBatches = () => api.post('/batches/seed');

// ── Mappings ─────────────────────────────────────────────────
export const getMappings = (params = {}) => api.get('/mappings', { params });
export const createMapping = (data) => api.post('/mappings', data);
export const deleteMapping = (id) => api.delete(`/mappings/${id}`);

// ── Timetable ─────────────────────────────────────────────────
export const getTimetable = (params = {}) => api.get('/timetable', { params });
export const generateTimetable = () => api.post('/timetable/generate');
export const getTimetableStats = () => api.get('/timetable/stats');
export const exportTimetable = (batchId) =>
    api.get(`/timetable/export/${batchId}`, { responseType: 'blob' });

export default api;
