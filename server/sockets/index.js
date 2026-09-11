const { verifyToken } = require('../utils/token');

let ioRef = null;

// Called once from server.js after `io` is created.
function initSockets(io) {
  ioRef = io;

  io.on('connection', (socket) => {
    // Client sends its JWT right after connecting so we can put it in a
    // private room (user:<id>) for targeted notifications.
    socket.on('auth', (token) => {
      const payload = token && verifyToken(token);
      if (payload) {
        socket.join(`user:${payload.sub}`);
        socket.data.userId = payload.sub;
        socket.data.userName = payload.name;
      }
    });

    // Course discussion chat: join a room per course, broadcast messages
    // to everyone else currently viewing that course in real time.
    socket.on('join-course', (courseId) => {
      if (courseId) socket.join(`course:${courseId}`);
    });
    socket.on('leave-course', (courseId) => {
      if (courseId) socket.leave(`course:${courseId}`);
    });

    socket.on('chat-message', async ({ courseId, text }) => {
      if (!courseId || !text || !socket.data.userId) return;
      try {
        const { Message } = require('../models');
        const msg = await Message.create({
          courseId, userId: socket.data.userId, userName: socket.data.userName || 'Student', text: String(text).slice(0, 1000),
        });
        io.to(`course:${courseId}`).emit('chat-message', msg);
      } catch (e) { /* swallow — chat is best-effort */ }
    });
  });
}

// Persists a Notification row AND pushes it live over the socket, so a
// connected client's bell icon updates instantly without polling
// (Task 13 — real-time notifications).
async function pushNotification(userId, message) {
  const { Notification } = require('../models');
  const record = await Notification.create({ userId, message });
  if (ioRef) {
    if (userId === 'all') ioRef.emit('notification', record);
    else ioRef.to(`user:${userId}`).emit('notification', record);
  }
  return record;
}

module.exports = { initSockets, pushNotification };
