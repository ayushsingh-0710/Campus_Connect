import React, { useState } from "react";
import PageContainer from "../../components/layout/PageContainer";
import SearchBar from "../../components/common/SearchBar";
import Icon from "../../components/common/Icon";
import SectionHeader from "../../components/layout/SectionHeader";
import StudentGrid from "../../components/students/StudentGrid";
import HackathonGrid from "../../components/hackathons/HackathonGrid";
import { students } from "../../data/students";
import { hackathons } from "../../data/hackathons";
import { useNavigate } from "../../routes/Router";
import { useAuth } from "../../context/AuthContext";

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/discover?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/discover");
    }
  };

  const userFirstName = user?.name ? user.name.split(" ")[0] : "Maya";

  return (
    <PageContainer>
      {/* Welcome Banner */}
      <section className="welcome">
        <div>
          <p className="eyebrow">Your campus, connected</p>
          <h1>
            Welcome back {userFirstName} <span aria-label="wave">👋</span>
          </h1>
          <p>Find people. Build teams. Create something.</p>
        </div>
        <div className="welcome-accent">
          <Icon name="spark" size={42} />
        </div>
      </section>

      {/* Hero Search Bar */}
      <div className="hero-search">
        <SearchBar
          placeholder="Search students, skills, teams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSubmit={handleSearchSubmit}
        />
      </div>

      {/* Stat Grid */}
      <section className="stat-grid">
        <article className="stat-card">
          <span className="stat-icon stat-blue">
            <Icon name="user" />
          </span>
          <div>
            <p>Profile completion</p>
            <strong>78%</strong>
          </div>
          <div className="progress">
            <span />
          </div>
          <button type="button" onClick={() => navigate("/profile")}>
            Complete profile <Icon name="arrow" size={15} />
          </button>
        </article>

        <article className="stat-card">
          <span className="stat-icon stat-cyan">
            <Icon name="people" />
          </span>
          <div>
            <p>Connections</p>
            <strong>42</strong>
          </div>
          <small>
            <b>+6</b> this month
          </small>
          <button type="button" onClick={() => navigate("/connections")}>
            View network <Icon name="arrow" size={15} />
          </button>
        </article>

        <article className="stat-card">
          <span className="stat-icon stat-amber">
            <Icon name="calendar" />
          </span>
          <div>
            <p>Upcoming hackathons</p>
            <strong>3</strong>
          </div>
          <small>Next up · 24 Oct</small>
          <button type="button" onClick={() => navigate("/hackathons")}>
            Explore events <Icon name="arrow" size={15} />
          </button>
        </article>
      </section>

      {/* Recommended Students */}
      <section className="content-section">
        <SectionHeader
          title="Recommended students"
          action="Discover all"
          onAction={() => navigate("/discover")}
        />
        <StudentGrid
          students={students.slice(0, 3)}
          compact
          onViewStudent={(s) => navigate(`/students/${s.id}`)}
        />
      </section>

      {/* Upcoming Hackathons */}
      <section className="content-section">
        <SectionHeader
          title="Upcoming hackathons"
          action="View all"
          onAction={() => navigate("/hackathons")}
        />
        <HackathonGrid
          hackathons={hackathons.slice(0, 2)}
          onViewHackathon={(h) => navigate(`/hackathons/${h.id}`)}
        />
      </section>
    </PageContainer>
  );
}

export default DashboardPage;
