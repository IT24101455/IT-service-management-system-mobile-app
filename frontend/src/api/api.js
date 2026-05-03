import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8081/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 - session expired
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ===== AUTH =====
export const login = (data) => API.post('/auth/login', data);
export const sendOtp = (data) => API.post('/auth/send-otp', data);
export const register = (data) => API.post('/auth/register', data);
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);

// ===== TICKETS =====
export const getTickets = () => API.get('/tickets');
export const getTicket = (id) => API.get(`/tickets/${id}`);
export const getTicketsByUser = (userId) => API.get(`/tickets/user/${userId}`);
export const getTicketsByTechnician = (techId) => API.get(`/tickets/technician/${techId}`);
export const createTicket = (data) => API.post('/tickets', data);
export const updateTicket = (id, data) => API.put(`/tickets/${id}`, data);
export const assignTechnician = (id, data) => API.patch(`/tickets/${id}/assign`, data);
export const deleteTicket = (id) => API.delete(`/tickets/${id}`);
export const getTicketStats = () => API.get('/tickets/stats');

// ===== USERS =====
export const getUsers = () => API.get('/users');
export const getUser = (id) => API.get(`/users/${id}`);
export const getUsersByRole = (role) => API.get(`/users/role/${role}`);
export const getAvailableTechnicians = () => API.get('/users/technicians/available');
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const uploadProfilePicture = (id, formData) => API.post(`/users/${id}/profile-picture`, formData);
export const removeProfilePicture = (id) => API.delete(`/users/${id}/profile-picture`);
export const deleteUser = (id) => API.delete(`/users/${id}`);
export const toggleUserActive = (id) => API.patch(`/users/${id}/toggle-active`);

export const getProfilePicUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `http://localhost:8081${path}`;
};

// ===== ASSETS =====
export const getAssets = () => API.get('/assets');
export const getAsset = (id) => API.get(`/assets/${id}`);
export const createAsset = (data) => API.post('/assets', data);
export const updateAsset = (id, data) => API.put(`/assets/${id}`, data);
export const deleteAsset = (id) => API.delete(`/assets/${id}`);
export const getAssetStats = () => API.get('/assets/stats');

// ===== NOTIFICATIONS =====
export const getNotifications = (userId) => API.get(`/notifications/user/${userId}`);
export const getUnreadCount = (userId) => API.get(`/notifications/user/${userId}/unread-count`);
export const markRead = (id) => API.patch(`/notifications/${id}/read`);
export const markAllRead = (userId) => API.patch(`/notifications/user/${userId}/read-all`);

// ===== PAYMENTS =====
export const getPayments = () => API.get('/payments');
export const getPaymentsByUser = (userId) => API.get(`/payments/user/${userId}`);
export const getPaymentByTicket = (ticketId) => API.get(`/payments/ticket/${ticketId}`);
export const createPayment = (data) => API.post('/payments', data);
export const markPaid = (id, data) => API.patch(`/payments/${id}/pay`, data);

// ===== REPORTS =====
export const getReportSummary = () => API.get('/reports/summary');
export const getCategoryBreakdown = () => API.get('/reports/category-breakdown');
export const getTechnicianPerformance = () => API.get('/reports/technician-performance');
export const getPriorityBreakdown = () => API.get('/reports/priority-breakdown');

// ===== CHAT =====
export const sendMessage = (data) => API.post('/chat/send', data);
export const getConversation = (user1, user2) => API.get('/chat/conversation', { params: { user1, user2 } });
export const getInbox = (userId) => API.get(`/chat/inbox/${userId}`);

// ===== COMPLAINTS =====
export const createComplaint = (data) => API.post('/complaints', data);
export const getComplaints = () => API.get('/complaints');
export const getUserComplaints = (userId) => API.get(`/complaints/user/${userId}`);
export const resolveComplaint = (id, resolutionNotes) => API.put(`/complaints/${id}/resolve`, { resolutionNotes });

// ===== LEAVES =====
export const getAllLeaves = () => API.get('/leaves');
export const getTechnicianLeaves = (technicianId) => API.get(`/leaves/technician/${technicianId}`);
export const createLeave = (data) => API.post('/leaves', data);
export const deleteLeave = (id) => API.delete(`/leaves/${id}`);
export const updateLeaveStatus = (id, status) => API.put(`/leaves/${id}/status`, { status });
export const uploadMedicalReport = (formData) => API.post('/leaves/upload-report', formData);

// Qualifications
export const addQualification = (userId, data) => API.post(`/qualifications/user/${userId}`, data);
export const removeQualification = (userId, qualId) => API.delete(`/qualifications/user/${userId}/${qualId}`);

// ===== TECHNICIAN SUBSCRIPTIONS =====
export const submitSubscription = (data) => API.post('/technician-subscriptions/submit', data);
export const getSubscriptionHistory = (techId) => API.get(`/technician-subscriptions/technician/${techId}`);
export const getAllSubscriptions = () => API.get('/technician-subscriptions/all');
export const approveSubscription = (id, adminId) => API.put(`/technician-subscriptions/${id}/approve`, null, { params: { adminId } });
export const rejectSubscription = (id, adminId, reason) => API.put(`/technician-subscriptions/${id}/reject`, null, { params: { adminId, reason } });
export const uploadSlip = (formData) => API.post('/technician-subscriptions/upload-slip', formData);
export const uploadMedia = (formData, folder = 'general') => API.post('/media/upload', formData, { params: { folder } });

export default API;
