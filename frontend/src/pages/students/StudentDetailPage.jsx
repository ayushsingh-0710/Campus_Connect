import React, { useMemo } from "react";
import PageContainer from "../../components/layout/PageContainer";
import ProfileHeader from "../../components/students/ProfileHeader";
import ProfileSection from "../../components/students/ProfileSection";
import Badge from "../../components/common/Badge";
import Icon from "../../components/common/Icon";
import Button from "../../components/common/Button";
import { useParams, useNavigate } from "../../routes/Router";
import { students } from "../../data/students";

export function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const student = useMemo(() => {
    if (!id) return students[0];
    return students.find((s) => s.id === id) || students[0];
  }, [id]);

  return (
    <PageContainer className="profile-page">
      {/* Back button */}
      <div className="mb-4">
        <Button
          variant="ghost"
          icon="arrow"
          onClick={() => navigate("/discover")}
          className="text-xs font-semibold pl-0 hover:bg-transparent"
        >
          Back to discover
        </Button>
      </div>

      {/* Hero Header */}
      <ProfileHeader student={student} />

      {/* Main & Sidebar Layout */}
      <div className="profile-layout">
        <div className="profile-main">
          {/* About */}
          <ProfileSection title="About">
            <p>{student?.bio}</p>
          </ProfileSection>

          {/* Skills */}
          <ProfileSection title="Skills">
            <div className="badge-row">
              {student?.skills?.map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>
          </ProfileSection>

          {/* Interests */}
          <ProfileSection title="Interests">
            <div className="interest-list">
              {student?.interests?.map((interest) => (
                <span key={interest}>{interest}</span>
              ))}
            </div>
          </ProfileSection>
        </div>

        <aside className="profile-side">
          {/* Social Links */}
          <ProfileSection title="Links">
            <div className="social-list">
              {student?.socialLinks?.linkedin && (
                <button
                  type="button"
                  onClick={() => window.open(`https://${student.socialLinks.linkedin}`, "_blank")}
                >
                  <Icon name="linkedin" />
                  <span>{student.socialLinks.linkedin}</span>
                  <Icon name="arrow" size={15} />
                </button>
              )}
              {student?.socialLinks?.github && (
                <button
                  type="button"
                  onClick={() => window.open(`https://${student.socialLinks.github}`, "_blank")}
                >
                  <Icon name="github" />
                  <span>{student.socialLinks.github}</span>
                  <Icon name="arrow" size={15} />
                </button>
              )}
              {student?.socialLinks?.portfolio && (
                <button
                  type="button"
                  onClick={() => window.open(`https://${student.socialLinks.portfolio}`, "_blank")}
                >
                  <Icon name="globe" />
                  <span>{student.socialLinks.portfolio}</span>
                  <Icon name="arrow" size={15} />
                </button>
              )}
            </div>
          </ProfileSection>

          {/* Hackathon Availability */}
          {student?.lookingForTeam && (
            <section className="card detail-card availability">
              <Icon name="team" size={24} />
              <div>
                <strong>Looking for a hackathon team</strong>
                <p>
                  Available for {student.hackathonInterest || "Build for Good 2025"}.
                </p>
              </div>
            </section>
          )}
        </aside>
      </div>
    </PageContainer>
  );
}

export default StudentDetailPage;
