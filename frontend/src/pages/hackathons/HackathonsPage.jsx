import React, { useState, useMemo } from "react";
import PageContainer from "../../components/layout/PageContainer";
import SearchBar from "../../components/common/SearchBar";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Icon from "../../components/common/Icon";
import SectionHeader from "../../components/layout/SectionHeader";
import HackathonGrid from "../../components/hackathons/HackathonGrid";
import EmptyState from "../../components/common/EmptyState";
import { hackathons } from "../../data/hackathons";
import { useNavigate } from "../../routes/Router";

export function HackathonsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const categories = ["Social impact", "Climate", "FinTech", "AI/ML", "Web"];
  const modes = ["Hybrid", "Online", "Offline"];

  const filteredHackathons = useMemo(() => {
    return hackathons.filter((h) => {
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesName = h.name.toLowerCase().includes(q);
        const matchesOrganizer = h.organizer.toLowerCase().includes(q);
        const matchesSkills = h.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesOrganizer && !matchesSkills) return false;
      }

      if (selectedMode && h.mode !== selectedMode) return false;
      if (selectedCategory && !h.skills.some((s) => s.toLowerCase() === selectedCategory.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [query, selectedMode, selectedCategory]);

  const hasActiveFilters = Boolean(query || selectedMode || selectedCategory);

  const clearFilters = () => {
    setQuery("");
    setSelectedMode(null);
    setSelectedCategory(null);
    setDropdownOpen(null);
  };

  return (
    <PageContainer>
      <div className="page-title">
        <p className="eyebrow">Learn by building</p>
        <h1>Hackathons</h1>
        <p>Find challenges, meet collaborators, and ship something new.</p>
      </div>

      <SearchBar
        placeholder="Search hackathons, organizers or categories..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Filter Row */}
      <div className="relative">
        <div className="filters">
          {/* Category Filter */}
          <div className="relative">
            <button
              type="button"
              className={selectedCategory ? "!border-blue-600 !text-blue-600 font-bold" : ""}
              onClick={() => setDropdownOpen(dropdownOpen === "category" ? null : "category")}
            >
              {selectedCategory ? `Category: ${selectedCategory}` : "Category"}
              <span>⌄</span>
            </button>
            {dropdownOpen === "category" && (
              <div className="absolute top-12 left-0 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-20 w-44">
                <button
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 rounded"
                  onClick={() => {
                    setSelectedCategory(null);
                    setDropdownOpen(null);
                  }}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded transition-colors ${
                      selectedCategory === cat ? "bg-blue-50 text-blue-600 font-semibold" : "hover:bg-slate-50"
                    }`}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setDropdownOpen(null);
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mode Filter */}
          <div className="relative">
            <button
              type="button"
              className={selectedMode ? "!border-blue-600 !text-blue-600 font-bold" : ""}
              onClick={() => setDropdownOpen(dropdownOpen === "mode" ? null : "mode")}
            >
              {selectedMode ? `Mode: ${selectedMode}` : "Mode"}
              <span>⌄</span>
            </button>
            {dropdownOpen === "mode" && (
              <div className="absolute top-12 left-0 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-20 w-40">
                <button
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 rounded"
                  onClick={() => {
                    setSelectedMode(null);
                    setDropdownOpen(null);
                  }}
                >
                  All Modes
                </button>
                {modes.map((m) => (
                  <button
                    key={m}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded transition-colors ${
                      selectedMode === m ? "bg-blue-50 text-blue-600 font-semibold" : "hover:bg-slate-50"
                    }`}
                    onClick={() => {
                      setSelectedMode(m);
                      setDropdownOpen(null);
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="clear-filter"
              onClick={clearFilters}
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Featured Callout Banner */}
      <div className="feature-callout">
        <div>
          <Badge tone="cyan">Featured opportunity</Badge>
          <h2>Build with people who care about the problem.</h2>
          <p>
            Build for Good brings together 250 students from 12 universities this October.
          </p>
          <Button
            onClick={() => navigate("/hackathons/build-for-good-2025")}
          >
            Explore featured hackathon
          </Button>
        </div>
        <span className="feature-symbol">
          <Icon name="code" size={54} />
        </span>
      </div>

      {/* Hackathons Grid */}
      <SectionHeader title="All hackathons" />
      {filteredHackathons.length === 0 ? (
        <EmptyState
          title="No hackathons found"
          description="Try broadening your search query or reset your mode/category filters."
          actionText="Clear filters"
          onAction={clearFilters}
        />
      ) : (
        <HackathonGrid
          hackathons={filteredHackathons}
          onViewHackathon={(h) => navigate(`/hackathons/${h.id}`)}
        />
      )}
    </PageContainer>
  );
}

export default HackathonsPage;
