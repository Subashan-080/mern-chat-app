// Map user IDs to all their active socket IDs (supports multiple tabs/devices).
const onlineUsers = new Map();

function addSocket(userId, socketId) {
  const key = userId.toString();
  const sockets = onlineUsers.get(key) || new Set();
  sockets.add(socketId);
  onlineUsers.set(key, sockets);
}

function removeSocket(userId, socketId) {
  const key = userId.toString();
  const sockets = onlineUsers.get(key);
  if (!sockets) return 0;

  sockets.delete(socketId);
  if (sockets.size === 0) onlineUsers.delete(key);
  return sockets.size;
}

function getOnlineUserIds() {
  return [...onlineUsers.keys()];
}

module.exports = { onlineUsers, addSocket, removeSocket, getOnlineUserIds };
