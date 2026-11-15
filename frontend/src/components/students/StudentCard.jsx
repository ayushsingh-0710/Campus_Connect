import React, { useState } from "react";
import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import Button from "../common/Button";
import Icon from "../common/Icon";
import { useNavigate } from "../../routes/Router";
import connectionService from "../../services/connectionService";

export function StudentCard({ student, onView, className = "" }) {
  const [requestState, setRequestState] = useState("idle"); // idle | sending | sent | error
  const navigate = useNavigate();

  const handleView = () => {
    if (onView) {
      onView();
    } else {
      navigate(`/students/${student.id || student._id}`);
    }
  };

  const handleConnect = async () => {
    if (requestState !== "idle") return;
    setRequestState("sending");
    try {
      // Send the MongoDB _id — not the whole student object
      const recipientId = student._id || student.id;
      await connectionService.sendConnectionRequest(recipientId);
      setRequestState("sent");
    } catch (err) {
      const msg = err.response?.data?.message || "";
      // If already connected or pending, treat as sent
      if (msg.includes("already") || msg.includes("pending")) {
        setRequestState("sent");
      } else {
        setRequestState("error");
        // Reset after 3s so user can retry
        setTimeout(() => setRequestState("idle"), 3000);
      }
    }
  };

  const isSent = requestState === "sent";
  const isSending = requestState === "sending";
  const isError = requestState === "error";

  return (
    <article className={`card student-card ${className}`.trim()}>
      <div className="student-head cursor-pointer" onClick={handleView}>
        <Avatar src={student.photo || student.profileImage} name={student.name || student.fullName} />
        <div>
          <h3 className="hover:text-blue-600 transition-colors">{student.name || student.fullName}</h3>
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
        {(student.skills || []).map((skill) => (
          <Badge key={skill}>{skill}</Badge>
        ))}
      </div>

      <div className="card-actions">
        <Button variant="secondary" onClick={handleView}>
          View profile
        </Button>
        <Button
          variant={isSent ? "ghost" : "primary"}
          icon={isSent ? "check" : isError ? undefined : "plus"}
          onClick={handleConnect}
          loading={isSending}
          disabled={isSent}
        >
          {isSent ? "Requested" : isError ? "Try again" : "Connect"}
        </Button>
      </div>
    </article>
  );
}

export default StudentCard;
