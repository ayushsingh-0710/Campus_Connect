import React, { useState, useEffect, useCallback } from "react";
import PageContainer from "../../components/layout/PageContainer";
import SearchBar from "../../components/common/SearchBar";
import StudentGrid from "../../components/students/StudentGrid";
import EmptyState from "../../components/common/EmptyState";
import studentService from "../../services/studentService";
import { useNavigate } from "../../routes/Router";

const FILTER_OPTIONS = {
  Skills: ["React", "Python", "Figma", "Accessibility", "UX Research", "ML", "Node.js"],
  Campus: ["North Campus", "City Campus", "West Campus"],
  Course: ["Computer Science", "Product Design", "Data Science", "Business & Computing", "Cybersecurity"],
  Year: [1, 2, 3, 4],
};

export function DiscoverPage() {
  const navigate = useNavigate();

  // Filter state
  const [query, setQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [activeFilterDropdown, setActiveFilterDropdown] = useState(null);

  // Data state
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasActiveFilters = Boolean(
    query || selectedSkill || selectedCampus || selectedCourse || selectedYear
  );

  // Fetch students from real API whenever filters change (debounced for search)
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (query.trim())     filters.query   = query.trim();
      if (selectedSkill)    filters.skill   = selectedSkill;
      if (selectedCampus)   filters.campus  = selectedCampus;
      if (selectedCourse)   filters.course  = selectedCourse;
      if (selectedYear)     filters.year    = selectedYear;

      const result = await studentService.searchStudents(filters);
      setStudents(result);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load students.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [query, selectedSkill, selectedCampus, selectedCourse, selectedYear]);

  // Debounce search input; filters apply immediately
  useEffect(() => {
    const timer = setTimeout(fetchStudents, query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchStudents, query]);

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

  // Normalize backend user shape to what StudentCard expects
  const normalizeStudent = (s) => ({
    ...s,
    id: s._id || s.id,
    name: s.fullName || s.name,
    year: s.yearOfStudy ? `${s.yearOfStudy}${s.yearOfStudy === 1 ? "st" : s.yearOfStudy === 2 ? "nd" : s.yearOfStudy === 3 ? "rd" : "th"} year` : "",
    photo: s.profileImage || s.photo || null,
  });

  const normalizedStudents = students.map(normalizeStudent);

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
                  onClick={() => { setSelectedSkill(null); setActiveFilterDropdown(null); }}
                >
                  All Skills
                </button>
                {FILTER_OPTIONS.Skills.map((sk) => (
                  <button
                    key={sk}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded transition-colors ${selectedSkill === sk ? "bg-blue-50 text-blue-600 font-semibold" : "hover:bg-slate-50"}`}
                    onClick={() => { setSelectedSkill(sk); setActiveFilterDropdown(null); }}
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
                  onClick={() => { setSelectedCampus(null); setActiveFilterDropdown(null); }}
                >
                  All Campuses
                </button>
                {FILTER_OPTIONS.Campus.map((c) => (
                  <button
                    key={c}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded transition-colors ${selectedCampus === c ? "bg-blue-50 text-blue-600 font-semibold" : "hover:bg-slate-50"}`}
                    onClick={() => { setSelectedCampus(c); setActiveFilterDropdown(null); }}
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
                  onClick={() => { setSelectedCourse(null); setActiveFilterDropdown(null); }}
                >
                  All Courses
                </button>
                {FILTER_OPTIONS.Course.map((cr) => (
                  <button
                    key={cr}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded transition-colors ${selectedCourse === cr ? "bg-blue-50 text-blue-600 font-semibold" : "hover:bg-slate-50"}`}
                    onClick={() => { setSelectedCourse(cr); setActiveFilterDropdown(null); }}
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
                  onClick={() => { setSelectedYear(null); setActiveFilterDropdown(null); }}
                >
                  All Years
                </button>
                {FILTER_OPTIONS.Year.map((yr) => (
                  <button
                    key={yr}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded transition-colors ${selectedYear === yr ? "bg-blue-50 text-blue-600 font-semibold" : "hover:bg-slate-50"}`}
                    onClick={() => { setSelectedYear(yr); setActiveFilterDropdown(null); }}
                  >
                    {yr}{yr === 1 ? "st" : yr === 2 ? "nd" : yr === 3 ? "rd" : "th"} year
                  </button>
                ))}
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <button type="button" className="clear-filter" onClick={clearAllFilters}>
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="results-line">
        <strong>
          {loading ? "…" : normalizedStudents.length}{" "}
          {normalizedStudents.length === 1 ? "student" : "students"}
        </strong>
        <span>{hasActiveFilters ? "Filtered results" : "Recommended for you"}</span>
      </div>

      {error && (
        <div className="text-red-500 text-sm py-4 text-center">{error}</div>
      )}

      {!loading && !error && normalizedStudents.length === 0 ? (
        <EmptyState
          title="No students found"
          description="Try adjusting your search terms or clearing filters to see more students from your campus."
          actionText="Clear all filters"
          onAction={clearAllFilters}
        />
      ) : (
        <StudentGrid
          students={normalizedStudents}
          onViewStudent={(s) => navigate(`/students/${s.id || s._id}`)}
        />
      )}
    </PageContainer>
  );
}

export default DiscoverPage;
