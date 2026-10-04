import React, { useState, useEffect } from "react";
import PageContainer from "../../components/layout/PageContainer";
import Button from "../../components/common/Button";
import TeamGrid from "../../components/teams/TeamGrid";
import TeamFormModal from "../../components/teams/TeamFormModal";
import EmptyState from "../../components/common/EmptyState";
import teamService from "../../services/teamService";
import { useNavigate } from "../../routes/Router";

export function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadTeams = async () => {
    setLoading(true);
    const data = await teamService.getAllTeams();
    setTeams(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleTeamCreated = (newTeam) => {
    setTeams([newTeam, ...teams]);
  };

  return (
    <PageContainer>
      <div className="page-title title-with-action">
        <div>
          <p className="eyebrow">Build together</p>
          <h1>My teams</h1>
          <p>Create a space for your next project, startup, or hackathon team.</p>
        </div>
        <Button icon="plus" onClick={() => setModalOpen(true)}>
          Create team
        </Button>
      </div>

      {teams.length === 0 && !loading ? (
        <EmptyState
          title="No teams created yet"
          description="Bring your ideas to life by creating a team or joining an existing project for upcoming campus hackathons."
          actionText="Create your first team"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <TeamGrid
          teams={teams}
          onViewTeam={(t) => navigate(`/teams/${t.id}`)}
        />
      )}

      <TeamFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onTeamCreated={handleTeamCreated}
      />
    </PageContainer>
  );
}

export default TeamsPage;
