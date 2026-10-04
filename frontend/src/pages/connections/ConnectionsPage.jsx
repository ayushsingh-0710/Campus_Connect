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
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    const [conns, reqs] = await Promise.all([
      connectionService.getConnections(),
      connectionService.getPendingRequests(),
    ]);
    setConnections(conns);
    setPending(reqs);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAccept = async (id) => {
    await connectionService.acceptRequest(id);
    await loadData();
  };

  const handleReject = async (id) => {
    await connectionService.rejectRequest(id);
    await loadData();
  };

  const handleRemove = async (id) => {
    await connectionService.removeConnection(id);
    await loadData();
  };

  const activeList = activeTab === "mine" ? connections : pending;

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
        connectionsCount={connections.length + 38} // Figma baseline
        pendingCount={pending.length}
      />

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

        {!loading && activeList.length === 0 && (
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
