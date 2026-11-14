import React, { useState, useEffect, useCallback } from "react";
import PageContainer from "../../components/layout/PageContainer";
import SectionHeader from "../../components/layout/SectionHeader";
import HackathonSearch from "../../components/hackathons/HackathonSearch";
import HackathonFilters from "../../components/hackathons/HackathonFilters";
import HackathonGrid from "../../components/hackathons/HackathonGrid";
import HackathonSkeleton from "../../components/hackathons/HackathonSkeleton";
import HackathonEmptyState from "../../components/hackathons/HackathonEmptyState";
import HackathonPagination from "../../components/hackathons/HackathonPagination";
import FeaturedHackathon from "../../components/hackathons/FeaturedHackathon";
import Icon from "../../components/common/Icon";
import hackathonAPI from "../../services/hackathonAPI";
import { useNavigate } from "../../routes/Router";

const INITIAL_FILTERS = {
  mode: "",
  category: "",
  status: "",
  teamSize: "",
  prizePool: "",
  participation: "",
  sourceType: "",
  country: "",
  state: "",
  city: "",
};

export function HackathonsPage() {
  const navigate = useNavigate();

  // Active view tab: "all" or "saved"
  const [activeTab, setActiveTab] = useState("all");

  // Search, Filter, Sort, Pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState("recently-added");
  const [page, setPage] = useState(1);
  const limit = 12;

  // Data states
  const [hackathons, setHackathons] = useState([]);
  const [featuredHackathon, setFeaturedHackathon] = useState(null);
  const [savedHackathons, setSavedHackathons] = useState([]);
  const [bookmarkedSet, setBookmarkedSet] = useState(new Set());
  const [locationOptions, setLocationOptions] = useState({
    counts: { total: 0, india: 0, international: 0, unknown: 0 },
    states: [],
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [error, setError] = useState(null);
  const [attribution, setAttribution] = useState("Opportunity listings powered by Brabble.ai");

  // 1. Fetch Featured Hackathon and Location Options on mount
  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        setLoadingFeatured(true);
        const [featuredRes, locationRes] = await Promise.allSettled([
          hackathonAPI.getFeaturedHackathons(1),
          hackathonAPI.getLocationOptions(),
        ]);

        if (isMounted) {
          if (featuredRes.status === "fulfilled" && featuredRes.value?.data?.length > 0) {
            setFeaturedHackathon(featuredRes.value.data[0]);
          }
          if (locationRes.status === "fulfilled" && locationRes.value?.data) {
            setLocationOptions(locationRes.value.data);
          }
        }
      } catch (err) {
        console.error("Error loading initial hackathon data:", err);
      } finally {
        if (isMounted) setLoadingFeatured(false);
      }
    };
    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch User's Saved Hackathons (to track bookmark states)
  const loadSavedHackathons = useCallback(async () => {
    try {
      const res = await hackathonAPI.getSavedHackathons();
      if (res.data) {
        setSavedHackathons(res.data);
        const set = new Set();
        res.data.forEach((h) => {
          if (h.slug) set.add(h.slug);
          if (h._id) set.add(h._id);
        });
        setBookmarkedSet(set);
      }
    } catch (err) {
      console.warn("Could not load saved bookmarks:", err.message);
    }
  }, []);

  useEffect(() => {
    loadSavedHackathons();
  }, [loadSavedHackathons]);

  // 3. Fetch Main Hackathons List from Backend API
  const fetchHackathons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit,
        sort: sortBy,
      };

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (filters.mode) params.mode = filters.mode;
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      if (filters.teamSize) params.teamSize = filters.teamSize;
      if (filters.prizePool) params.prizePool = filters.prizePool;
      if (filters.participation) params.participation = filters.participation;
      if (filters.sourceType === "Live Events") params.isDemo = false;
      if (filters.sourceType === "Demo Data") params.isDemo = true;
      if (filters.country) params.country = filters.country;
      if (filters.state) params.state = filters.state;
      if (filters.city) params.city = filters.city;

      const res = await hackathonAPI.getHackathons(params);

      setHackathons(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
      if (res.attribution) {
        setAttribution(res.attribution);
      }
    } catch (err) {
      console.error("Failed to fetch hackathons:", err);
      setError("Unable to connect to the Hackathon discovery service. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, searchTerm, filters]);

  useEffect(() => {
    if (activeTab === "all") {
      fetchHackathons();
    }
  }, [fetchHackathons, activeTab]);

  // Handle Search Debounce
  const handleDebouncedSearch = (val) => {
    setSearchTerm(val);
    setPage(1); // reset to page 1 on new search
  };

  // Handle Filter Change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Clear All Filters
  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSearchTerm("");
    setSortBy("recently-added");
    setPage(1);
  };

  // Bookmark toggle callback
  const handleBookmarkToggle = (id) => {
    loadSavedHackathons();
  };

  const hasActiveFilters = Boolean(
    searchTerm ||
    filters.mode ||
    filters.category ||
    filters.status ||
    filters.teamSize ||
    filters.prizePool ||
    filters.participation ||
    filters.country ||
    filters.state ||
    filters.city
  );

  return (
    <PageContainer>
      {/* Page Header */}
      <div className="page-title mb-6">
        <p className="eyebrow">Discover & Build</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hackathons</h1>
            <p className="text-slate-500 mt-1">
              Explore university hackathons, find challenges tailored to your skills, and form winning teams.
            </p>
          </div>

          {/* Tab Switcher: Explore vs Saved */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 self-start shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "all"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Explore All
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("saved")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "saved"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon name="bookmark" size={13} />
              Saved
              {savedHackathons.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-700">
                  {savedHackathons.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Live Brabble & Regional Filter Notice Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-3.5 mb-6 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 text-xs text-blue-900 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Icon name="spark" size={13} />
          </span>
          <div>
            <span className="font-bold">Live Opportunities & India-Only Filtering Active:</span>{" "}
            <span className="text-blue-800">
              Explore national and campus hackathons synchronized via Brabble.ai, Devpost, Unstop, and Internshala with verified 3-tier geographic filtering (Country › State › City).
            </span>
          </div>
        </div>
        <span className="hidden md:inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider shrink-0 shadow-xs">
          Live + Verified
        </span>
      </div>

      {activeTab === "all" ? (
        <>
          {/* Featured Hackathon Hero */}
          <FeaturedHackathon
            hackathon={featuredHackathon}
            loading={loadingFeatured}
          />

          {/* Search Bar */}
          <div className="my-4">
            <HackathonSearch
              value={searchTerm}
              onDebouncedChange={handleDebouncedSearch}
            />
          </div>

          {/* Filter System & Sorting */}
          <HackathonFilters
            filters={filters}
            locationOptions={locationOptions}
            onChange={handleFilterChange}
            onClear={handleClearFilters}
            sortBy={sortBy}
            onSortChange={(val) => {
              setSortBy(val);
              setPage(1);
            }}
          />

          {/* Section Header */}
          <div className="flex items-center justify-between mt-6 mb-4">
            <SectionHeader
              title={
                hasActiveFilters
                  ? `Filtered Hackathons (${pagination.total})`
                  : `All Hackathons (${pagination.total})`
              }
            />
          </div>

          {/* Error State */}
          {error && (
            <div className="card p-6 border-red-200 bg-red-50 text-red-700 rounded-xl my-4 text-center">
              <p className="font-semibold">{error}</p>
              <button
                type="button"
                onClick={fetchHackathons}
                className="mt-3 btn border border-red-300 bg-white text-red-700 text-xs hover:bg-red-50"
              >
                <Icon name="refresh" size={14} /> Retry Connection
              </button>
            </div>
          )}

          {/* Loading Skeletons */}
          {loading && !error && <HackathonSkeleton count={6} />}

          {/* Empty Results State */}
          {!loading && !error && hackathons.length === 0 && (
            <HackathonEmptyState
              title="No hackathons match your search"
              description="No hackathons match the selected filters or search terms. Try clearing some criteria."
              onAction={handleClearFilters}
            />
          )}

          {/* Hackathon Cards Grid */}
          {!loading && !error && hackathons.length > 0 && (
            <>
              <HackathonGrid
                hackathons={hackathons}
                bookmarkedIds={bookmarkedSet}
                onBookmarkToggle={handleBookmarkToggle}
                onViewHackathon={(h) => navigate(`/hackathons/${h.slug || h._id || h.id}`)}
              />

              {/* Pagination */}
              <HackathonPagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalResults={pagination.total}
                limit={limit}
                onPageChange={(newPage) => setPage(newPage)}
              />
            </>
          )}
        </>
      ) : (
        /* Saved Hackathons View */
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <SectionHeader
              title={`Saved Hackathons (${savedHackathons.length})`}
            />
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              Browse more hackathons
              <Icon name="arrow" size={13} />
            </button>
          </div>

          {savedHackathons.length === 0 ? (
            <HackathonEmptyState
              icon="bookmark"
              title="You haven't saved any hackathons yet"
              description="Browse the directory and click the bookmark icon on any hackathon card to save it here for quick reference."
              actionText="Explore Hackathons"
              onAction={() => setActiveTab("all")}
            />
          ) : (
            <HackathonGrid
              hackathons={savedHackathons}
              bookmarkedIds={bookmarkedSet}
              onBookmarkToggle={handleBookmarkToggle}
              onViewHackathon={(h) => navigate(`/hackathons/${h.slug || h._id || h.id}`)}
            />
          )}
        </div>
      )}

      {/* Brabble.ai Attribution Section */}
      <footer className="mt-12 py-5 px-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <Icon name="spark" size={16} className="text-blue-600 shrink-0" />
          <span>
            {attribution || "Opportunity listings powered by Brabble.ai"} — Aggregated from Unstop, Internshala, and national university tech circles.
          </span>
        </div>
        <a
          href="https://brabble.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
        >
          <span>Visit Brabble.ai</span>
          <Icon name="externalLink" size={12} />
        </a>
      </footer>
    </PageContainer>
  );
}

export default HackathonsPage;
