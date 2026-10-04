import React from "react";
import Badge from "../common/Badge";
import Button from "../common/Button";
import Icon from "../common/Icon";
import { useNavigate } from "../../routes/Router";

export function HackathonCard({
  hackathon,
  onView,
  className = "",
}) {
  const navigate = useNavigate();

  const handleView = () => {
    if (onView) {
      onView();
    } else {
      navigate(`/hackathons/${hackathon.id}`);
    }
  };

  const getTone = (mode) => {
    if (mode === "Online") return "cyan";
    if (mode === "Hybrid") return "green";
    return "blue";
  };

  return (
    <article className={`card hack-card ${className}`.trim()}>
      <div className="hack-top">
        <span className="hack-icon">
          <Icon name="code" />
        </span>
        <Badge tone={getTone(hackathon.mode)}>{hackathon.mode}</Badge>
      </div>

      <div className="cursor-pointer" onClick={handleView}>
        <h3 className="hover:text-blue-600 transition-colors">{hackathon.name}</h3>
        <p className="organizer">by {hackathon.organizer}</p>
      </div>

      <p className="student-bio line-clamp-2">{hackathon.description}</p>

      <div className="hack-meta">
        <span>
          <Icon name="calendar" size={16} />
          {hackathon.date}
        </span>
        <span>
          <Icon name="location" size={16} />
          {hackathon.location}
        </span>
      </div>

      <div className="card-actions">
        <span className="deadline">Register by {hackathon.deadline}</span>
        <Button variant="secondary" onClick={handleView}>
          View details
        </Button>
      </div>
    </article>
  );
}

export default HackathonCard;
