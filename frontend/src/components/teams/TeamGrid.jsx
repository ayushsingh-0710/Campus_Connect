import React from "react";
import TeamCard from "./TeamCard";

export function TeamGrid({ teams = [], className = "", onViewTeam }) {
  return (
    <div className={`team-grid ${className}`.trim()}>
      {teams.map((team, index) => (
        <TeamCard
          key={team.id || team.name}
          team={team}
          index={index}
          onView={onViewTeam ? () => onViewTeam(team) : undefined}
        />
      ))}
    </div>
  );
}

export default TeamGrid;
