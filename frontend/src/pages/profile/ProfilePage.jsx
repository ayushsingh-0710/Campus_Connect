import React, { useState } from "react";
import PageContainer from "../../components/layout/PageContainer";
import Avatar from "../../components/common/Avatar";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Icon from "../../components/common/Icon";
import { useAuth } from "../../context/AuthContext";

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || "Maya Chen");
  const [course, setCourse] = useState(user?.course || "Computer Science");
  const [year, setYear] = useState(user?.year || "3rd year");
  const [campus, setCampus] = useState(user?.campus || "North Campus");
  const [bio, setBio] = useState(user?.bio || "");
  const [skills, setSkills] = useState(user?.skills ? user.skills.join(", ") : "");
  const [interests, setInterests] = useState(user?.interests ? user.interests.join(", ") : "");
  const [linkedin, setLinkedin] = useState(user?.socialLinks?.linkedin || "linkedin.com/in/mayachen");
  const [github, setGithub] = useState(user?.socialLinks?.github || "github.com/mayac");
  const [portfolio, setPortfolio] = useState(user?.socialLinks?.portfolio || "mayachen.design");

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);

    const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
    const interestsArray = interests.split(",").map((s) => s.trim()).filter(Boolean);

    updateProfile({
      name,
      course,
      year,
      campus,
      bio,
      skills: skillsArray,
      interests: interestsArray,
      socialLinks: {
        linkedin,
        github,
        portfolio,
      },
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  return (
    <PageContainer>
      <div className="page-title title-with-action">
        <div>
          <p className="eyebrow">Personal profile</p>
          <h1>Profile & settings</h1>
          <p>Keep your information current so the right people can find you.</p>
        </div>
        {saved && (
          <span className="saved">
            <Icon name="check" />
            Changes saved
          </span>
        )}
      </div>

      <form className="settings-form" onSubmit={handleSubmit}>
        {/* Photo Section */}
        <section className="card settings-section">
          <div className="settings-heading">
            <div>
              <h2>Profile photo</h2>
              <p>A clear photo helps people recognize you across campus.</p>
            </div>
          </div>
          <div className="photo-edit">
            <Avatar src={user?.photo} name={user?.name || "Student"} size="lg" />
            <Button
              variant="secondary"
              type="button"
              onClick={() => alert("Upload photo dialogue: select image from file system.")}
            >
              Change photo
            </Button>
            <Button
              variant="ghost"
              type="button"
              onClick={() => alert("Photo removed.")}
            >
              Remove
            </Button>
          </div>
        </section>

        {/* Basic Information */}
        <section className="card settings-section">
          <div className="settings-heading">
            <div>
              <h2>Basic information</h2>
              <p>Your public student details.</p>
            </div>
          </div>
          <div className="form-grid">
            <Input
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              required
            />
            <Input
              label="Year of study"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
            <Input
              label="Campus"
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
            />
          </div>
          <Input
            label="Bio"
            textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </section>

        {/* Skills & Interests */}
        <section className="card settings-section">
          <div className="settings-heading">
            <div>
              <h2>Skills & interests</h2>
              <p>Help others understand what you know and care about.</p>
            </div>
          </div>
          <div>
            <Input
              label="Skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              hint="Comma separated"
            />
            <Input
              label="Interests"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              hint="Comma separated"
            />
          </div>
        </section>

        {/* Social Links */}
        <section className="card settings-section">
          <div className="settings-heading">
            <div>
              <h2>Social links</h2>
              <p>Add places where people can see your work.</p>
            </div>
          </div>
          <div className="form-grid">
            <Input
              label="LinkedIn"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
            />
            <Input
              label="GitHub"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
            />
            <Input
              label="Portfolio"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
            />
          </div>
        </section>

        <div className="save-row">
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}

export default ProfilePage;
