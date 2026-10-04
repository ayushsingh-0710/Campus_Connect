import React, { useState } from "react";
import Badge from "../common/Badge";
import Button from "../common/Button";
import Icon from "../common/Icon";
import SectionHeader from "../layout/SectionHeader";
import hackathonService from "../../services/hackathonService";

export function HackathonInfo({ hackathon, className = "" }) {
  const [registered, setRegistered] = useState(Boolean(hackathon?.registered));
  const [registering, setRegistering] = useState(false);

  const handleRegister = async () => {
    setRegistering(true);
    await hackathonService.toggleRegistration(hackathon.id);
    setRegistered(!registered);
    setRegistering(false);
  };

  return (
    <div className={`hackathon-info ${className}`.trim()}>
      <section className="hack-detail-hero">
        <div>
          <Badge tone={hackathon?.mode === "Online" ? "cyan" : "green"}>
            {hackathon?.featured ? "Featured · " : ""}
            {hackathon?.mode}
          </Badge>
          <p className="eyebrow">{hackathon?.organizer} presents</p>
          <h1>{hackathon?.name}</h1>
          <p>{hackathon?.description}</p>
          <div className="badge-row">
            {hackathon?.skills?.map((skill) => (
              <Badge key={skill}>{skill}</Badge>
            ))}
          </div>
        </div>

        <div className="register-card card">
          <p>Registration closes</p>
          <strong>{hackathon?.deadline}</strong>
          <small>{registered ? "You are registered!" : "Registration open"}</small>
          <Button
            variant={registered ? "secondary" : "primary"}
            icon={registered ? "check" : undefined}
            onClick={handleRegister}
            loading={registering}
          >
            {registered ? "Registered" : "Register now"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.open("https://github.com", "_blank")}
          >
            View source
          </Button>
        </div>
      </section>

      <div className="detail-grid">
        <section className="card detail-card detail-copy">
          <SectionHeader title="About the hackathon" />
          <p>{hackathon?.fullDescription || hackathon?.description}</p>

          <SectionHeader title="Eligibility" />
          <p>{hackathon?.eligibility}</p>
        </section>

        <aside className="card detail-card facts">
          <SectionHeader title="Event details" />
          <dl>
            <div>
              <dt>
                <Icon name="calendar" />
                Dates
              </dt>
              <dd>{hackathon?.date}</dd>
            </div>
            <div>
              <dt>
                <Icon name="location" />
                Location
              </dt>
              <dd>{hackathon?.location}</dd>
            </div>
            <div>
              <dt>
                <Icon name="team" />
                Team size
              </dt>
              <dd>{hackathon?.teamSize}</dd>
            </div>
            <div>
              <dt>
                <Icon name="spark" />
                Prizes
              </dt>
              <dd>{hackathon?.prizes}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}

export default HackathonInfo;
