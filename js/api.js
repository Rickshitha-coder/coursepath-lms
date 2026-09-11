/* ==========================================================================
   api.js — Coursepath frontend data layer.

   This is a thin REST + WebSocket client for the real backend in /server
   (Express + SQLite/Sequelize + JWT + bcrypt + Socket.IO). Every function
   below has the exact same name and signature the previous localStorage-only
   prototype used, so none of the HTML pages needed to change — only what's
   behind Api.* changed, from reading localStorage to calling a real API.

   The app is served BY that same backend (see /server/server.js), so all
   requests below use relative paths ('/api/...') — no separate host/port
   or CORS configuration needed.
   ========================================================================== */

const Api = (() => {
  const TOKEN_KEY = 'lms_token';

  // ---------- token / session ----------
  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
  function clearToken() { localStorage.removeItem(TOKEN_KEY); }

  // Real backend issues a real JWT (header.payload.signature, base64url).
  // Reading your OWN token client-side to show a name/role in the navbar is
  // normal practice — the payload isn't secret, only the signature check
  // (which only the server can do) is what actually protects anything.
  function base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    return decodeURIComponent(atob(str).split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''));
  }
  function decodeToken(token) {
    try {
      const parts = token.split('.');
      const payload = JSON.parse(base64UrlDecode(parts[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) return null; // expired
      return payload;
    } catch (e) { return null; }
  }

  function currentUser() {
    const token = getToken();
    if (!token) return null;
    const payload = decodeToken(token);
    if (!payload) { clearToken(); return null; }
    return { id: payload.sub, role: payload.role, name: payload.name };
  }

  function requireAuth() {
    const user = currentUser();
    if (!user) { window.location.href = 'login.html'; return null; }
    return user;
  }
  function requireRole(role) {
    const user = requireAuth();
    if (user && user.role !== role) {
      window.location.href = user.role === 'admin' ? 'admin-dashboard.html' : 'student-dashboard.html';
      return null;
    }
    return user;
  }
  function getSession() {
    const token = getToken();
    return token ? { token } : null;
  }

  // ---------- low-level request helper ----------
  async function request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;
    try {
      const res = await fetch(path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
      let data = null;
      try { data = await res.json(); } catch (e) { /* empty body */ }
      if (!res.ok) return { ok: false, status: res.status, error: (data && data.error) || 'Something went wrong.' };
      return { ok: true, status: res.status, data };
    } catch (e) {
      return { ok: false, status: 0, error: 'Could not reach the server. Is it running?' };
    }
  }

  // ---------- auth ----------
  async function register({ name, email, password, department }) {
    return request('POST', '/api/auth/register', { name, email, password, department });
  }
  async function login({ email, password }) {
    const res = await request('POST', '/api/auth/login', { email, password });
    if (res.ok) { setToken(res.data.token); connectSocket(); refreshNotifCache(); }
    return res;
  }
  function logout() {
    clearToken();
    disconnectSocket();
    window.location.href = 'index.html';
  }
  async function resetPassword({ email, newPassword }) {
    return request('POST', '/api/auth/reset-password', { email, newPassword });
  }

  // ---------- courses ----------
  async function listCourses({ q, category } = {}) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category && category !== 'all') params.set('category', category);
    const qs = params.toString();
    return request('GET', '/api/courses' + (qs ? '?' + qs : ''));
  }
  async function getCourse(id) { return request('GET', `/api/courses/${id}`); }
  async function createCourse(payload) { return request('POST', '/api/courses', payload); }
  async function updateCourse(id, payload) { return request('PUT', `/api/courses/${id}`, payload); }
  async function deleteCourse(id) { return request('DELETE', `/api/courses/${id}`); }

  // ---------- enrollments ----------
  async function myEnrollments(studentId) { return request('GET', `/api/enrollments/student/${studentId}`); }
  async function isEnrolled(studentId, courseId) {
    const res = await request('GET', `/api/enrollments/${studentId}/${courseId}/check`);
    return res.ok ? !!res.data : false;
  }
  async function enroll(studentId, courseId) { return request('POST', `/api/enrollments/${studentId}/${courseId}`); }

  // ---------- progress ----------
  async function getProgress(studentId, courseId) { return request('GET', `/api/progress/student/${studentId}/course/${courseId}`); }
  async function allProgressForStudent(studentId) { return request('GET', `/api/progress/student/${studentId}`); }
  async function completeModule(studentId, courseId, moduleId) { return request('POST', `/api/progress/${studentId}/${courseId}/${moduleId}`); }

  // ---------- notifications (with a live cache kept in sync over Socket.IO) ----------
  let notifCache = [];
  async function refreshNotifCache() {
    const user = currentUser();
    if (!user) { notifCache = []; return; }
    const res = await request('GET', `/api/notifications/${user.id}`);
    if (res.ok) notifCache = res.data;
    if (window.UI && document.getElementById('navbar-mount')) UI.renderNavbar(document.body.dataset.page);
  }
  async function listNotifications(userId) {
    const res = await request('GET', `/api/notifications/${userId}`);
    if (res.ok) notifCache = res.data;
    return res;
  }
  async function markAllRead(userId) {
    const res = await request('PUT', `/api/notifications/${userId}/read`);
    notifCache = notifCache.map(n => ({ ...n, read: true }));
    return res;
  }
  function unreadCount(userId) {
    return notifCache.filter(n => (n.userId === userId || n.userId === 'all') && !n.read).length;
  }

  // ---------- admin ----------
  async function listStudents() { return request('GET', '/api/admin/students'); }
  async function deleteStudent(id) { return request('DELETE', `/api/admin/students/${id}`); }
  async function adminStats() { return request('GET', '/api/admin/stats'); }

  // ---------- Socket.IO: real-time notifications ----------
  // The server hosts the client bundle itself at /socket.io/socket.io.js
  // (see server/server.js), so this works fully offline too.
  let socket = null;
  function connectSocket() {
    if (socket || typeof io === 'undefined') return;
    socket = io();
    socket.on('connect', () => { const t = getToken(); if (t) socket.emit('auth', t); });
    socket.on('notification', (n) => {
      const user = currentUser();
      if (!user) return;
      if (n.userId === user.id || n.userId === 'all') {
        notifCache.unshift(n);
        if (window.UI) {
          UI.toast(n.message);
          if (document.getElementById('navbar-mount')) UI.renderNavbar(document.body.dataset.page);
        }
      }
    });
  }
  function disconnectSocket() {
    if (socket) { socket.disconnect(); socket = null; }
  }
  function getSocket() { return socket; }

  // Boot: if already logged in (token in localStorage from a previous
  // visit), connect the socket and warm the notification cache right away.
  if (currentUser()) { connectSocket(); refreshNotifCache(); }

  return {
    // auth
    register, login, logout, resetPassword, currentUser, requireAuth, requireRole, getSession,
    // courses
    listCourses, getCourse, createCourse, updateCourse, deleteCourse,
    // enrollment & learning
    myEnrollments, isEnrolled, enroll, getProgress, allProgressForStudent, completeModule,
    // notifications
    listNotifications, markAllRead, unreadCount,
    // admin
    listStudents, deleteStudent, adminStats,
    // realtime
    getSocket,
  };
})();
