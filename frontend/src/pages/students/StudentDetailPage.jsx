import React, { useState, useEffect } from "react";
import PageContainer from "../../components/layout/PageContainer";
import ProfileHeader from "../../components/students/ProfileHeader";
import ProfileSection from "../../components/students/ProfileSection";
import Badge from "../../components/common/Badge";
import Icon from "../../components/common/Icon";
import Button from "../../components/common/Button";
import { useParams, useNavigate } from "../../routes/Router";
import studentService from "../../services/studentService";
import connectionService from "../../services/connectionService";

export function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Connection request state
  const [connecting, setConnecting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [connectError, setConnectError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    studentService
      .getStudentById(id)
      .then((data) => {
        // Normalize backend shape → UI shape
        setStudent({
          ...data,
          id: data._id || data.id,
          name: data.fullName || data.name,
          year: data.yearOfStudy
            ? `${data.yearOfStudy}${data.yearOfStudy === 1 ? "st" : data.yearOfStudy === 2 ? "nd" : data.yearOfStudy === 3 ? "rd" : "th"} year`
            : "",
          photo: data.profileImage || data.photo || null,
        });
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || "Student not found.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleConnect = async () => {
    if (requestSent || connecting) return;
    setConnecting(true);
    setConnectError(null);
    try {
      await connectionService.sendConnectionRequest(id);
      setRequestSent(true);
    } catch (err) {
      setConnectError(err.response?.data?.message || "Could not send request.");
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer className="profile-page">
        <div className="text-slate-400 text-sm py-12 text-center">Loading profile…</div>
      </PageContainer>
    );
  }

  if (error || !student) {
    return (
      <PageContainer className="profile-page">
        <div className="mb-4">
          <Button variant="ghost" icon="arrow" onClick={() => navigate("/discover")} className="text-xs font-semibold pl-0 hover:bg-transparent">
            Back to discover
          </Button>
        </div>
        <div className="text-red-500 text-sm py-12 text-center">{error || "Student not found."}</div>
      </PageContainer>
    );
  }

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

      {/* Connect button */}
      <div className="mt-4 flex items-center gap-3">
        <Button
          variant={requestSent ? "ghost" : "primary"}
          icon={requestSent ? "check" : "plus"}
          onClick={handleConnect}
          loading={connecting}
          disabled={requestSent}
        >
          {requestSent ? "Request sent" : "Connect"}
        </Button>
        {connectError && <span className="text-red-500 text-xs">{connectError}</span>}
      </div>

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
                <p>Available for {student.hackathonInterest || "Build for Good 2025"}.</p>
              </div>
            </section>
          )}
        </aside>
      </div>
    </PageContainer>
  );
}

export default StudentDetailPage;
