import React from "react";
import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import Button from "../common/Button";
import { useNavigate } from "../../routes/Router";

export function ConnectionCard({
  student,
  status,
  date,
  onAccept,
  onReject,
  onRemove,
  className = "",
}) {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/students/${student.id}`);
  };

  return (
    <article className={`card connection-card ${className}`.trim()}>
      <div className="cursor-pointer" onClick={handleView}>
        <Avatar src={student.photo} name={student.name} />
      </div>

      <div className="connection-info cursor-pointer" onClick={handleView}>
        <h3 className="hover:text-blue-600 transition-colors">{student.name}</h3>
        <p>
          {student.course} · {student.year}
        </p>
        <div className="badge-row">
          {student.skills.slice(0, 3).map((skill) => (
            <Badge key={skill}>{skill}</Badge>
          ))}
        </div>
      </div>

      <div className="connection-status">
        <span>
          <i />
          {status === "connected"
            ? "Connected"
            : status === "pending_incoming"
            ? "Wants to connect"
            : "Invitation sent"}
        </span>
      </div>

      <div className="connection-actions">
        <Button variant="secondary" onClick={handleView}>
          View profile
        </Button>
        {status === "connected" && onRemove && (
          <Button variant="ghost" onClick={onRemove}>
            Remove
          </Button>
        )}
        {status === "pending_incoming" && (
          <>
            {onAccept && <Button onClick={onAccept}>Accept</Button>}
            {onReject && (
              <Button variant="ghost" onClick={onReject}>
                Reject
              </Button>
            )}
          </>
        )}
      </div>
    </article>
  );
}

export default ConnectionCard;
