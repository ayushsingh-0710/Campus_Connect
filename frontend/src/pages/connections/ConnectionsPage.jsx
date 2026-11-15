import React, { useState, useEffect } from "react";
import PageContainer from "../../components/layout/PageContainer";
import ConnectionTabs from "../../components/connections/ConnectionTabs";
import ConnectionCard from "../../components/connections/ConnectionCard";
import EmptyState from "../../components/common/EmptyState";
import connectionService from "../../services/connectionService";
import { useNavigate } from "../../routes/Router";

export function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState("mine");
  const [connections, setConnections] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [conns, reqs] = await Promise.all([
        connectionService.getConnections(),
        connectionService.getPendingRequests(),
      ]);
      setConnections(conns);
      setPending(reqs);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load connections.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAccept = async (connectionId) => {
    try {
      await connectionService.acceptRequest(connectionId);
      await loadData();
    } catch (err) {
      console.error("Accept failed:", err.response?.data?.message || err.message);
    }
  };

  const handleReject = async (connectionId) => {
    try {
      await connectionService.rejectRequest(connectionId);
      await loadData();
    } catch (err) {
      console.error("Reject failed:", err.response?.data?.message || err.message);
    }
  };

  const handleRemove = async (connectionId) => {
    try {
      await connectionService.removeConnection(connectionId);
      await loadData();
    } catch (err) {
      console.error("Remove failed:", err.response?.data?.message || err.message);
    }
  };

  // Normalize connections list → ConnectionCard shape
  // Accepted connections: { _id, connectedUser: { _id, fullName, ... } }
  const normalizeConnection = (item) => {
    const user = item.connectedUser || item.requester || item.recipient || {};
    return {
      id: item._id,
      student: {
        id: user._id || user.id,
        name: user.fullName || user.name || "Student",
        course: user.course || "",
        campus: user.campus || "",
        photo: user.profileImage || user.photo || null,
        skills: user.skills || [],
      },
      status: "connected",
      date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "",
    };
  };

  // Normalize pending requests → ConnectionCard shape
  // Pending requests: { _id, requester: { _id, fullName, ... }, status: "pending" }
  const normalizePending = (item) => {
    const user = item.requester || {};
    return {
      id: item._id,
      student: {
        id: user._id || user.id,
        name: user.fullName || user.name || "Student",
        course: user.course || "",
        campus: user.campus || "",
        photo: user.profileImage || user.photo || null,
        skills: user.skills || [],
      },
      status: "pending_incoming",
      date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "",
    };
  };

  const normalizedConnections = connections.map(normalizeConnection);
  const normalizedPending = pending.map(normalizePending);
  const activeList = activeTab === "mine" ? normalizedConnections : normalizedPending;

  return (
    <PageContainer>
      <div className="page-title">
        <p className="eyebrow">Your network</p>
        <h1>Connections</h1>
        <p>Stay in touch with the people you build and learn with.</p>
      </div>

      <ConnectionTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        connectionsCount={normalizedConnections.length}
        pendingCount={normalizedPending.length}
      />

      {error && (
        <div className="text-red-500 text-sm py-4 text-center">{error}</div>
      )}

      <div className="connection-list">
        {activeList.map((item) => (
          <ConnectionCard
            key={item.id}
            student={item.student}
            status={item.status}
            date={item.date}
            onAccept={() => handleAccept(item.id)}
            onReject={() => handleReject(item.id)}
            onRemove={() => handleRemove(item.id)}
          />
        ))}

        {!loading && !error && activeList.length === 0 && (
          <EmptyState
            title={activeTab === "mine" ? "No connections yet" : "No pending requests"}
            description={
              activeTab === "mine"
                ? "Start discovering fellow student makers, designers and developers across your campus."
                : "You have reviewed all incoming connection requests."
            }
            actionText={activeTab === "mine" ? "Discover students" : undefined}
            onAction={() => navigate("/discover")}
          />
        )}
      </div>
    </PageContainer>
  );
}

export default ConnectionsPage;
