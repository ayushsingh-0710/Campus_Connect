import React, { useState, useMemo } from "react";
import PageContainer from "../../components/layout/PageContainer";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Icon from "../../components/common/Icon";
import SectionHeader from "../../components/layout/SectionHeader";
import { useParams, useNavigate } from "../../routes/Router";
import { teams } from "../../data/teams";

export function TeamDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  const team = useMemo(() => {
    if (!id) return teams[0];
    return teams.find((t) => t.id === id) || teams[0];
  }, [id]);

  const handleJoinToggle = () => {
    setJoining(true);
    setTimeout(() => {
      setJoined(!joined);
      setJoining(false);
    }, 300);
  };

  const memberList = team?.members || [];
  const memberCount = team?.membersCount || memberList.length || 1;

  return (
    <PageContainer>
      {/* Back button */}
      <div className="mb-4">
        <Button
          variant="ghost"
          icon="arrow"
          onClick={() => navigate("/teams")}
          className="text-xs font-semibold pl-0 hover:bg-transparent"
        >
          Back to all teams
        </Button>
      </div>

      {/* Team Hero Header */}
      <section className="profile-hero card mb-6">
        <div className="profile-identity">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 flex-shrink-0">
            <Icon name="team" size={32} />
          </div>
          <div>
            <div className="online-label">
              <span />
              Active Project Team
            </div>
            <h1>{team?.name}</h1>
            <p>{team?.desc}</p>
            {team?.hackathonName && (
              <p className="location-line">
                <Icon name="code" size={16} />
                Competing in: <strong>{team.hackathonName}</strong>
              </p>
            )}
          </div>
        </div>
        <Button
          variant={joined ? "secondary" : "primary"}
          icon={joined ? "check" : "plus"}
          onClick={handleJoinToggle}
          loading={joining}
        >
          {joined ? "Request Sent" : "Request to Join Team"}
        </Button>
      </section>

      {/* Team Content Grid */}
      <div className="detail-grid">
        <div className="detail-copy flex flex-col gap-5">
          {/* Mission / Description */}
          <section className="card detail-card">
            <SectionHeader title="About the team" />
            <p>{team?.fullDesc || team?.desc}</p>
          </section>

          {/* Members Roster */}
          <section className="card detail-card">
            <SectionHeader
              title={`Team Members (${memberList.length})`}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {memberList.length > 0 ? (
                memberList.map((member) => (
                  <div
                    key={member.name}
                    className="p-3 border border-slate-100 rounded-xl flex items-center gap-3 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <Avatar src={member.photo} name={member.name} size="md" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{member.name}</h4>
                      <p className="text-xs text-slate-500">{member.role}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No members listed yet.</p>
              )}
            </div>
          </section>

          {/* Open Roles */}
          {team?.openRoles && team.openRoles.length > 0 && (
            <section className="card detail-card">
              <SectionHeader title="Looking for collaborators" />
              <div className="flex flex-wrap gap-2 mt-2">
                {team.openRoles.map((role) => (
                  <span
                    key={role}
                    className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold"
                  >
                    🔍 {role}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="card detail-card facts">
          <SectionHeader title="Skills & Tech Stack" />
          <div className="badge-row mb-6">
            {team?.skills?.map((skill) => (
              <Badge key={skill}>{skill}</Badge>
            ))}
          </div>

          <SectionHeader title="Team Overview" />
          <dl>
            <div>
              <dt>
                <Icon name="people" />
                Team size
              </dt>
              <dd>{memberCount} students</dd>
            </div>
            <div>
              <dt>
                <Icon name="location" />
                Campus
              </dt>
              <dd>Riverside North Campus</dd>
            </div>
            <div>
              <dt>
                <Icon name="calendar" />
                Target Hackathon
              </dt>
              <dd>{team?.hackathonName || "Build for Good 2025"}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </PageContainer>
  );
}

export default TeamDetailPage;
