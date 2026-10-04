import React, { useState } from "react";
import Avatar from "../common/Avatar";
import Button from "../common/Button";
import Icon from "../common/Icon";
import connectionService from "../../services/connectionService";

export function ProfileHeader({ student, className = "" }) {
  const [connected, setConnected] = useState(Boolean(student?.connected));
  const [loading, setLoading] = useState(false);

  const handleConnectToggle = async () => {
    setLoading(true);
    if (!connected) {
      await connectionService.sendConnectionRequest(student);
      setConnected(true);
    } else {
      await connectionService.removeConnection(student.id);
      setConnected(false);
    }
    setLoading(false);
  };

  const firstName = student?.name ? student.name.split(" ")[0] : "Student";

  return (
    <section className={`profile-hero card ${className}`.trim()}>
      <div className="profile-identity">
        <Avatar src={student?.photo} name={student?.name || "Student"} size="xl" />
        <div>
          <div className="online-label">
            <span />
            Open to collaborate
          </div>
          <h1>{student?.name}</h1>
          <p>
            {student?.course} · {student?.year}
          </p>
          <p className="location-line">
            <Icon name="location" size={16} />
            {student?.university} · {student?.campus}
          </p>
        </div>
      </div>
      <Button
        icon={connected ? "check" : "plus"}
        variant={connected ? "secondary" : "primary"}
        onClick={handleConnectToggle}
        loading={loading}
      >
        {connected ? `Connected with ${firstName}` : `Connect with ${firstName}`}
      </Button>
    </section>
  );
}

export default ProfileHeader;
