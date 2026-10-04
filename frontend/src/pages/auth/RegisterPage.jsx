import React, { useState } from "react";
import Logo from "../../components/common/Logo";
import Badge from "../../components/common/Badge";
import Avatar from "../../components/common/Avatar";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { photos } from "../../data/students";
import { Link, useNavigate } from "../../routes/Router";
import { useAuth } from "../../context/AuthContext";

export function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [university, setUniversity] = useState("Riverside University");
  const [campus, setCampus] = useState("North Campus");
  const [course, setCourse] = useState("Computer Science");
  const [year, setYear] = useState("1st year");
  const [skills, setSkills] = useState("React, JavaScript");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Please complete all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
      await register({
        name: fullName,
        email,
        university,
        campus,
        course,
        year,
        skills: skillsArray,
      });
      navigate("/");
    } catch {
      setError("Registration failed. Please check your information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      {/* Left Brand Showcase */}
      <section className="auth-brand">
        <div className="auth-brand-inner">
          <Logo />
          <div>
            <Badge tone="cyan">Built for student builders</Badge>
            <h1>
              Find your people.
              <br />
              Build what matters.
            </h1>
            <p>
              Connect with skilled students, discover your next hackathon, and turn an idea into a
              team.
            </p>
          </div>
          <div className="auth-proof">
            <div className="avatar-stack">
              {photos.slice(1, 5).map((photo, index) => (
                <Avatar key={photo} src={photo} name={`Campus member ${index + 1}`} size="sm" />
              ))}
            </div>
            <p>
              <strong>2,400+</strong> students already connecting
            </p>
          </div>
        </div>
      </section>

      {/* Right Form Card */}
      <section className="auth-form-wrap">
        <div className="auth-form auth-form-wide">
          <div className="mobile-auth-logo">
            <Logo />
          </div>
          <p className="eyebrow">Create your account</p>
          <h2>Join Campus Connect</h2>
          <p className="form-intro">
            Tell us a little about you to personalize your campus experience.
          </p>

          {error && (
            <div className="p-3 mb-4 rounded-lg bg-red-50 text-xs text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <Input
                label="Full name"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label="Email"
                placeholder="you@university.edu"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                placeholder="At least 8 characters"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                label="University"
                placeholder="Select university"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
              />
              <Input
                label="Campus"
                placeholder="Select campus"
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
              />
              <Input
                label="Course"
                placeholder="Your course"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              />
              <Input
                label="Year of study"
                placeholder="Select year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
              <Input
                label="Skills"
                placeholder="e.g. React, Research, Python"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>

            <Button type="submit" className="auth-submit" loading={loading}>
              Create account
            </Button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;
