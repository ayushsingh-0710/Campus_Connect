import React, { useState } from "react";
import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import Button from "../common/Button";
import Icon from "../common/Icon";
import { useNavigate } from "../../routes/Router";
import connectionService from "../../services/connectionService";

export function StudentCard({ student, onView, className = "" }) {
  const [connected, setConnected] = useState(Boolean(student?.connected));
  const [connecting, setConnecting] = useState(false);
  const navigate = useNavigate();

  const handleView = () => {
    if (onView) {
      onView();
    } else {
      navigate(`/students/${student.id}`);
    }
  };

  const handleConnectToggle = async () => {
    setConnecting(true);
    if (!connected) {
      await connectionService.sendConnectionRequest(student);
      setConnected(true);
    } else {
      await connectionService.removeConnection(student.id);
      setConnected(false);
    }
    setConnecting(false);
  };

  return (
    <article className={`card student-card ${className}`.trim()}>
      <div className="student-head cursor-pointer" onClick={handleView}>
        <Avatar src={student.photo} name={student.name} />
        <div>
          <h3 className="hover:text-blue-600 transition-colors">{student.name}</h3>
          <p>
            {student.course} · {student.year}
          </p>
        </div>
      </div>

      <p className="student-campus">
        <Icon name="location" size={15} />
        {student.campus}
      </p>

      <p className="student-bio line-clamp-3">{student.bio}</p>

      <div className="badge-row">
        {student.skills.map((skill) => (
          <Badge key={skill}>{skill}</Badge>
        ))}
      </div>

      <div className="card-actions">
        <Button variant="secondary" onClick={handleView}>
          View profile
        </Button>
        <Button
          variant={connected ? "ghost" : "primary"}
          icon={connected ? "check" : "plus"}
          onClick={handleConnectToggle}
          loading={connecting}
        >
          {connected ? "Connected" : "Connect"}
        </Button>
      </div>
    </article>
  );
}

export default StudentCard;
