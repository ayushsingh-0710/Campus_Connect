import React from "react";
import HackathonCard from "./HackathonCard";

export function HackathonGrid({
  hackathons = [],
  className = "",
  onViewHackathon,
}) {
  return (
    <div className={`hack-grid ${className}`.trim()}>
      {hackathons.map((h) => (
        <HackathonCard
          key={h.id || h.name}
          hackathon={h}
          onView={onViewHackathon ? () => onViewHackathon(h) : undefined}
        />
      ))}
    </div>
  );
}

export default HackathonGrid;
