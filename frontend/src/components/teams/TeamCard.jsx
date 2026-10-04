import React from "react";
import Badge from "../common/Badge";
import Button from "../common/Button";
import Icon from "../common/Icon";
import { useNavigate } from "../../routes/Router";

export function TeamCard({
  team,
  index = 0,
  onView,
  className = "",
}) {
  const navigate = useNavigate();

  const handleView = () => {
    if (onView) {
      onView();
    } else {
      navigate(`/teams/${team.id}`);
    }
  };

  const emblemClass =
    team.colorVariant !== undefined
      ? `team-${team.colorVariant}`
      : `team-${index % 2}`;

  const memberCount =
    team.membersCount || (team.members ? team.members.length : 1);

  return (
    <article className={`card team-card ${className}`.trim()}>
      <div className={`team-emblem ${emblemClass}`}>
        <Icon name="team" size={28} />
      </div>

      <div className="cursor-pointer" onClick={handleView}>
        <h3 className="hover:text-blue-600 transition-colors">{team.name}</h3>
        <p className="line-clamp-2">{team.desc}</p>
      </div>

      <div className="badge-row">
        {team.skills.map((skill) => (
          <Badge key={skill}>{skill}</Badge>
        ))}
      </div>

      <div className="team-footer">
        <span>
          <Icon name="people" size={17} />
          {memberCount} {memberCount === 1 ? "member" : "members"}
        </span>
        <Button variant="secondary" onClick={handleView}>
          View team
        </Button>
      </div>
    </article>
  );
}

export default TeamCard;
