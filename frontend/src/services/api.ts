import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (import.meta.env.VITE_ENABLE_API_LOGS === 'true') {
    const metodo = config.method?.toUpperCase();
    console.group(`🚀 [API Request] ${metodo} ${config.url}`);
    console.log('🔗 URL Completa:', `${config.baseURL}${config.url}`);
    if (config.data) console.log('📦 Body:', config.data);
    console.log('🔑 Token presente:', !!token);
    console.groupEnd();
  }
  
  return config;
});

// Interceptor: handle 401 responses
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.VITE_ENABLE_API_LOGS === 'true') {
      console.group(`✅ [API Response] 200 OK - ${response.config.url}`);
      console.log('📄 Datos recibidos:', response.data);
      console.groupEnd();
    }
    return response;
  },
  (error) => {
    if (import.meta.env.VITE_ENABLE_API_LOGS === 'true') {
      console.group(`❌ [API Error] Ocurrió un error en ${error.config?.url}`);
      console.error('Código de estado:', error.response?.status);
      console.error('Detalles:', error.response?.data);
      console.groupEnd();
    }
    if (error.response?.status === 401) {
      const isLoginRoute = error.config?.url?.includes('/auth/login');
      if (!isLoginRoute) {
        localStorage.removeItem('nexus_token');
        localStorage.removeItem('nexus_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ============ Auth Service ============
export const authService = {
  register: (data: { nombres: string; apellidos: string; email: string; contrasena: string; rol: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; contrasena: string }) =>
    api.post('/auth/login', data),

  getMe: () => api.get('/auth/me'),
};

// ============ Sessions Service ============
export const sessionService = {
  getMySessions: () => api.get('/sessions/my-sessions'),
  listByMatching: (matchingId: string) => api.get(`/matchings/${matchingId}/sessions`),
  create: (matchingId: string, data: unknown) => api.post(`/matchings/${matchingId}/sessions`, data),
  update: (sesionId: string, data: unknown) => api.put(`/sessions/${sesionId}`, data),
  delete: (sesionId: string) => api.delete(`/sessions/${sesionId}`),
};

// ============ OKR Service ============
export const okrService = {
  listBySession: (sesionId: string) => api.get(`/sessions/${sesionId}/okrs`),
  create: (sesionId: string, data: unknown) => api.post(`/sessions/${sesionId}/okrs`, data),
  update: (okrId: string, data: unknown) => api.put(`/okrs/${okrId}`, data),

  delete: (okrId: string) => api.delete(`/okrs/${okrId}`),

  complete: (okrId: string, data: { valor_actual: number; nota_cierre: string }) =>
    api.post(`/okrs/${okrId}/complete`, data),

  feedback: (okrId: string, data: { accion: 'aprobar' | 'revisar'; comentario?: string }) =>
    api.post(`/okrs/${okrId}/feedback`, data),
};

// ============ Vacancies Service ============
export const vacancyService = {
  list: (modalidad?: string) =>
    api.get('/vacancies', { params: modalidad ? { modalidad } : {} }),

  getById: (vacancyId: string) =>
    api.get(`/vacancies/${vacancyId}`),

  create: (data: Record<string, unknown>) =>
    api.post('/vacancies', data),

  update: (vacancyId: string, data: Record<string, unknown>) =>
    api.put(`/vacancies/${vacancyId}`, data),

  apply: (vacancyId: string, mensaje?: string) =>
    api.post(`/vacancies/${vacancyId}/apply`, { mensaje }),

  getMyApplications: () =>
    api.get('/vacancies/my-applications'),
};

// ============ Profile Service ============
export const profileService = {
  getMyProfile: () => api.get('/profile/me'),

  updateMyProfile: (data: Record<string, unknown>) =>
    api.put('/profile/me', data),

  listSkills: () => api.get('/profile/skills'),

  addSkill: (data: { habilidad_id: string; nivel: string }) =>
    api.post('/profile/skills', data),

  removeSkill: (habilidadId: string) =>
    api.delete(`/profile/skills/${habilidadId}`),

  buyExtra: (data: { type: 'curso' | 'mentor', amount: number }) =>
    api.post('/profile/me/buy-extra', data),

  getUserProfile: (userId: string) =>
    api.get(`/profile/user/${userId}`),
};

// ============ IA Service ============
export const iaService = {
  getRiesgoAbandono: () => api.get('/ia/riesgo-abandono'),
  listarRiesgos: () => api.get('/ia/riesgo-abandono/all'),
};

// ============ Notification Service ============
export const notificationService = {
  list: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (notificationId: string) => api.patch(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

// ============ Classroom Service ============
export const classroomService = {
  getFeed: (matchingId: string) => api.get(`/classroom/${matchingId}/feed`),
  createPost: (matchingId: string, data: { tipo: string; titulo?: string; contenido: string; url_enlace?: string }) =>
    api.post(`/classroom/${matchingId}/posts`, data),
  deletePost: (postId: string) => api.delete(`/classroom/posts/${postId}`),
  togglePin: (postId: string) => api.patch(`/classroom/posts/${postId}/pin`),
  addComment: (postId: string, contenido: string) =>
    api.post(`/classroom/posts/${postId}/comments`, { contenido }),
  deleteComment: (commentId: string) => api.delete(`/classroom/comments/${commentId}`),
  addResource: (postId: string, data: { nombre: string; url: string; tipo?: string }) =>
    api.post(`/classroom/posts/${postId}/resources`, data),
  getPeople: (matchingId: string) => api.get(`/classroom/${matchingId}/people`),
};

// ============ Chat Service ============
export const chatService = {
  getMessages: (matchingId: string) => api.get(`/chat/${matchingId}/messages`),
  sendMessage: (matchingId: string, contenido: string) =>
    api.post(`/chat/${matchingId}/messages`, { contenido }),
  getUnreadCount: (matchingId: string) => api.get(`/chat/${matchingId}/unread`),
};

// ============ Membership Service ============
export const membershipService = {
  list: () => api.get('/memberships'),
  update: (id: string, data?: unknown) => api.put(`/memberships/${id}`, data || {}),
  upgrade: (membresia_id: string, simulationData: unknown) =>
    api.post('/memberships/upgrade', { membresia_id, simulationData }),
};

// ============ Mentors Service ============
export const mentorsService = {
  list: () => api.get('/matchings/mentors'),
  request: (mentorId: string) => api.post(`/matchings/mentors/${mentorId}/request`),
  requestMentor: (mentorId: string) => api.post(`/matchings/mentors/${mentorId}/request`),
  generateMatching: () => api.post('/matchings/generate'),
};

// ============ Course Service ============
export const courseService = {
  list: () => api.get('/courses'),
  mine: () => api.get('/courses/mine'),
  getById: (courseId: string) => api.get(`/courses/${courseId}`),
  create: (data: unknown) => api.post('/courses', data),
  join: (courseId: string) => api.post(`/courses/${courseId}/join`),
  leave: (courseId: string) => api.post(`/courses/${courseId}/leave`),
  open: (courseId: string) => api.patch(`/courses/${courseId}/open`),
  close: (courseId: string) => api.patch(`/courses/${courseId}/close`),
  createPost: (courseId: string, data: unknown) => api.post(`/courses/${courseId}/posts`, data),
  getPosts: (courseId: string) => api.get(`/courses/${courseId}/posts`),
  addComment: (postId: string, contenido: string) => api.post(`/courses/posts/${postId}/comments`, { contenido }),
  deletePost: (postId: string) => api.delete(`/courses/posts/${postId}`),
  submitAssignment: (assignmentId: string, data: unknown) => api.post(`/courses/assignments/${assignmentId}/submit`, data),
  exportGrades: (courseId: string) => api.get(`/courses/${courseId}/grades/export`, { responseType: 'blob' }),
  getAssignmentSubmissions: (assignmentId: string) => api.get(`/courses/assignments/${assignmentId}/submissions`),
  getFeed: (courseId: string) => api.get(`/courses/${courseId}/feed`),
  getStudents: (courseId: string) => api.get(`/courses/${courseId}/students`),
  getGrades: (courseId: string) => api.get(`/courses/${courseId}/grades`),
  togglePin: (postId: string) => api.patch(`/courses/posts/${postId}/pin`),
  deleteComment: (commentId: string) => api.delete(`/courses/comments/${commentId}`),
  gradeSubmission: (submissionId: string, data: { nota: number; feedback_mentor?: string }) => 
    api.put(`/courses/submissions/${submissionId}/grade`, data),
};
