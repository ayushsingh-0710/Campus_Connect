import React, { useState, useMemo } from "react";
import PageContainer from "../../components/layout/PageContainer";
import SearchBar from "../../components/common/SearchBar";
import StudentGrid from "../../components/students/StudentGrid";
import EmptyState from "../../components/common/EmptyState";
import { students } from "../../data/students";
import { useNavigate } from "../../routes/Router";

export function DiscoverPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [activeFilterDropdown, setActiveFilterDropdown] = useState(null);

  // Available options
  const filterOptions = {
    Skills: ["React", "Python", "Figma", "Accessibility", "UX Research", "ML", "Node.js"],
    Campus: ["North Campus", "City Campus", "West Campus"],
    Course: ["Computer Science", "Product Design", "Data Science", "Business & Computing", "Cybersecurity"],
    Year: ["1st year", "2nd year", "3rd year", "4th year"],
    Interests: ["Climate technology", "Inclusive design", "Hackathons", "Fintech", "Assistive Tech"],
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(q);
        const matchesCourse = student.course.toLowerCase().includes(q);
        const matchesCampus = student.campus.toLowerCase().includes(q);
        const matchesSkills = student.skills.some((s) => s.toLowerCase().includes(q));
        const matchesInterests = student.interests.some((i) => i.toLowerCase().includes(q));
        if (!matchesName && !matchesCourse && !matchesCampus && !matchesSkills && !matchesInterests) {
          return false;
        }
      }

      if (selectedSkill && !student.skills.includes(selectedSkill)) {
        return false;
      }
      if (selectedCampus && student.campus !== selectedCampus) {
        return false;
      }
      if (selectedCourse && student.course !== selectedCourse) {
        return false;
      }
      if (selectedYear && student.year !== selectedYear) {
        return false;
      }

      return true;
    });
  }, [query, selectedSkill, selectedCampus, selectedCourse, selectedYear]);

  const hasActiveFilters = Boolean(
    query || selectedSkill || selectedCampus || selectedCourse || selectedYear
  );

  const clearAllFilters = () => {
    setQuery("");
    setSelectedSkill(null);
    setSelectedCampus(null);
    setSelectedCourse(null);
    setSelectedYear(null);
    setActiveFilterDropdown(null);
  };

  const toggleDropdown = (name) => {
    setActiveFilterDropdown(activeFilterDropdown === name ? null : name);
  };

  return (
    <PageContainer>
      <div className="page-title">
        <p className="eyebrow">Grow your network</p>
        <h1>Discover students</h1>
        <p>Find collaborators by what they know, study, and care about.</p>
      </div>

      <SearchBar
        placeholder="Search by name, skill, course or interest..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Filter Row */}
      <div className="relative">
        <div className="filters">
          {/* Skill Filter */}
          <div className="relative">
            <button
              type="button"
              className={selectedSkill ? "!border-blue-600 !text-blue-600 font-bold" : ""}
              onClick={() => toggleDropdown("skill")}
            >
              {selectedSkill ? `Skill: ${selectedSkill}` : "Skills"}
              <span>⌄</span>
            </button>
            {activeFilterDropdown === "skill" && (
              <div className="absolute top-12 left-0 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-20 w-48">
                <button
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 rounded"
                  onClick={() => {
                    setSelectedSkill(null);
                    setActiveFilterDropdown(null);
                  }}
                >
                  All Skills
                </button>
                {filterOptions.Skills.map((sk) => (
                  <button
                    key={sk}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded transition-colors ${
                      selectedSkill === sk ? "bg-blue-50 text-blue-600 font-semibold" : "hover:bg-slate-50"
                    }`}
                    onClick={() => {
                      setSelectedSkill(sk);
                      setActiveFilterDropdown(null);
                    }}
                  >
                    {sk}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Campus Filter */}
          <div className="relative">
            <button
              type="button"
              className={selectedCampus ? "!border-blue-600 !text-blue-600 font-bold" : ""}
              onClick={() => toggleDropdown("campus")}
            >
              {selectedCampus ? `Campus: ${selectedCampus}` : "Campus"}
              <span>⌄</span>
            </button>
            {activeFilterDropdown === "campus" && (
              <div className="absolute top-12 left-0 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-20 w-48">
                <button
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 rounded"
                  onClick={() => {
                    setSelectedCampus(null);
                    setActiveFilterDropdown(null);
                  }}
                >
                  All Campuses
                </button>
                {filterOptions.Campus.map((c) => (
                  <button
                    key={c}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded transition-colors ${
                      selectedCampus === c ? "bg-blue-50 text-blue-600 font-semibold" : "hover:bg-slate-50"
                    }`}
                    onClick={() => {
                      setSelectedCampus(c);
                      setActiveFilterDropdown(null);
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Course Filter */}
          <div className="relative">
            <button
              type="button"
              className={selectedCourse ? "!border-blue-600 !text-blue-600 font-bold" : ""}
              onClick={() => toggleDropdown("course")}
            >
              {selectedCourse ? `Course: ${selectedCourse}` : "Course"}
              <span>⌄</span>
            </button>
            {activeFilterDropdown === "course" && (
              <div className="absolute top-12 left-0 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-20 w-56">
                <button
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 rounded"
                  onClick={() => {
                    setSelectedCourse(null);
                    setActiveFilterDropdown(null);
                  }}
                >
                  All Courses
                </button>
                {filterOptions.Course.map((cr) => (
                  <button
                    key={cr}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded transition-colors ${
                      selectedCourse === cr ? "bg-blue-50 text-blue-600 font-semibold" : "hover:bg-slate-50"
                    }`}
                    onClick={() => {
                      setSelectedCourse(cr);
                      setActiveFilterDropdown(null);
                    }}
                  >
                    {cr}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Year Filter */}
          <div className="relative">
            <button
              type="button"
              className={selectedYear ? "!border-blue-600 !text-blue-600 font-bold" : ""}
              onClick={() => toggleDropdown("year")}
            >
              {selectedYear ? `Year: ${selectedYear}` : "Year"}
              <span>⌄</span>
            </button>
            {activeFilterDropdown === "year" && (
              <div className="absolute top-12 left-0 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-20 w-40">
                <button
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 rounded"
                  onClick={() => {
                    setSelectedYear(null);
                    setActiveFilterDropdown(null);
                  }}
                >
                  All Years
                </button>
                {filterOptions.Year.map((yr) => (
                  <button
                    key={yr}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded transition-colors ${
                      selectedYear === yr ? "bg-blue-50 text-blue-600 font-semibold" : "hover:bg-slate-50"
                    }`}
                    onClick={() => {
                      setSelectedYear(yr);
                      setActiveFilterDropdown(null);
                    }}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="clear-filter"
              onClick={clearAllFilters}
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="results-line">
        <strong>
          {filteredStudents.length} {filteredStudents.length === 1 ? "student" : "students"}
        </strong>
        <span>
          {hasActiveFilters ? "Filtered results" : "Recommended for you"}
        </span>
      </div>

      {filteredStudents.length === 0 ? (
        <EmptyState
          title="No students found"
          description="Try adjusting your search terms or clearing filters to see more students from your campus."
          actionText="Clear all filters"
          onAction={clearAllFilters}
        />
      ) : (
        <StudentGrid
          students={filteredStudents}
          onViewStudent={(s) => navigate(`/students/${s.id}`)}
        />
      )}
    </PageContainer>
  );
}

export default DiscoverPage;
