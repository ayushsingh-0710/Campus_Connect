import React, { useState } from "react";
import Logo from "../../components/common/Logo";
import Badge from "../../components/common/Badge";
import Avatar from "../../components/common/Avatar";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { photos } from "../../data/students";
import { Link, useNavigate } from "../../routes/Router";
import { useAuth } from "../../context/AuthContext";

export function LoginPage() {
  const [email, setEmail] = useState("maya.chen@university.edu");
  const [password, setPassword] = useState("••••••••");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your university email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Failed to sign in. Please verify your credentials.");
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
        <div className="auth-form">
          <div className="mobile-auth-logo">
            <Logo />
          </div>
          <p className="eyebrow">Welcome back</p>
          <h2>Good to see you again</h2>
          <p className="form-intro">Enter your details to continue to your network.</p>

          {error && (
            <div className="p-3 mb-4 rounded-lg bg-red-50 text-xs text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="University email"
              placeholder="you@university.edu"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              className="forgot"
              type="button"
              onClick={() => alert("Password reset instructions have been sent to your university email.")}
            >
              Forgot password?
            </button>

            <Button type="submit" className="auth-submit" loading={loading}>
              Log in
            </Button>
          </form>

          <p className="auth-switch">
            New to Campus Connect?{" "}
            <Link to="/register" className="font-semibold text-blue-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
