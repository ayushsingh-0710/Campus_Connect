import { initialConnections } from "../data/connections";

const CONNECTIONS_STORAGE_KEY = "campus_connect_connections";

function getStoredConnections() {
  try {
    const raw = localStorage.getItem(CONNECTIONS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [...initialConnections];
}

function saveStoredConnections(items) {
  try {
    localStorage.setItem(CONNECTIONS_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export const connectionService = {
  getConnections() {
    const items = getStoredConnections();
    return Promise.resolve(items.filter((i) => i.status === "connected"));
  },

  getPendingRequests() {
    const items = getStoredConnections();
    return Promise.resolve(items.filter((i) => i.status === "pending_incoming"));
  },

  acceptRequest(id) {
    const items = getStoredConnections().map((item) => {
      if (item.id === id || item.student.id === id) {
        return { ...item, status: "connected", date: "Connected just now" };
      }
      return item;
    });
    saveStoredConnections(items);
    return Promise.resolve(items);
  },

  rejectRequest(id) {
    const items = getStoredConnections().filter(
      (item) => item.id !== id && item.student.id !== id
    );
    saveStoredConnections(items);
    return Promise.resolve(items);
  },

  removeConnection(id) {
    const items = getStoredConnections().filter(
      (item) => item.id !== id && item.student.id !== id
    );
    saveStoredConnections(items);
    return Promise.resolve(items);
  },

  sendConnectionRequest(student) {
    const items = getStoredConnections();
    const existing = items.find((i) => i.student.id === student.id);
    if (existing) {
      return Promise.resolve(existing);
    }
    const newConn = {
      id: `conn-${Date.now()}`,
      student,
      status: "pending_outgoing",
      date: "Requested just now",
    };
    items.push(newConn);
    saveStoredConnections(items);
    return Promise.resolve(newConn);
  },
};

export default connectionService;
