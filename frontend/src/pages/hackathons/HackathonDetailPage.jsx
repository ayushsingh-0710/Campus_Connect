import React, { useState, useEffect } from "react";
import PageContainer from "../../components/layout/PageContainer";
import SectionHeader from "../../components/layout/SectionHeader";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Icon from "../../components/common/Icon";
import BookmarkButton from "../../components/hackathons/BookmarkButton";
import hackathonAPI from "../../services/hackathonAPI";
import { useParams, useNavigate } from "../../routes/Router";

export function HackathonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hackathon, setHackathon] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);

        const res = await hackathonAPI.getHackathonDetails(id);
        if (isMounted && res.data) {
          setHackathon(res.data);

          // Check bookmark status
          try {
            const bRes = await hackathonAPI.checkBookmarkStatus(id);
            if (isMounted) setIsBookmarked(Boolean(bRes.bookmarked));
          } catch (bErr) {
            // Non-fatal if bookmark check fails
          }
        }
      } catch (err) {
        console.error("Failed to load hackathon details:", err);
        if (isMounted) {
          setError(
            err.response?.status === 404
              ? `Hackathon with identifier "${id}" could not be found.`
              : "Failed to load hackathon details. Please ensure the backend server is running."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDetails();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Not specified";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getModeTone = (mode) => {
    if (mode === "Online") return "cyan";
    if (mode === "Hybrid") return "green";
    return "blue";
  };

  const getStatusTone = (status) => {
    switch (status) {
      case "Closing Soon":
        return "amber";
      case "Closed":
        return "neutral";
      case "Upcoming":
        return "blue";
      case "Open":
      default:
        return "green";
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="py-6 space-y-6 animate-pulse">
          <div className="w-36 h-8 bg-slate-200 rounded-lg" />
          <div className="h-64 bg-slate-200 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-96 bg-slate-200 rounded-2xl" />
            <div className="h-96 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !hackathon) {
    return (
      <PageContainer>
        <div className="card text-center py-16 px-6 max-w-xl mx-auto my-12 border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Icon name="close" size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Hackathon Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">{error || "The requested hackathon does not exist."}</p>
          <Button variant="secondary" onClick={() => navigate("/hackathons")}>
            <span className="rotate-180 inline-block">
              <Icon name="arrow" size={14} />
            </span>
            Back to Hackathons
          </Button>
        </div>
      </PageContainer>
    );
  }

  const title = hackathon.title || hackathon.name;
  const organizer = hackathon.organizer;
  const platform = hackathon.platform || (hackathon.isDemo ? "Demo" : "Brabble");
  const categories = hackathon.categories || hackathon.skills || [];
  const technologies = hackathon.technologies || [];
  const isClosed = hackathon.status === "Closed";

  // Team size display logic
  let teamSizeText = "Check listing";
  if (hackathon.teamSize?.label && hackathon.teamSize.label !== "Check listing") {
    teamSizeText = hackathon.teamSize.label;
  } else if (typeof hackathon.teamSize === "object" && hackathon.teamSize.min != null) {
    if (hackathon.teamSize.min === hackathon.teamSize.max) {
      teamSizeText = `${hackathon.teamSize.min} Member${hackathon.teamSize.min > 1 ? "s" : ""}`;
    } else {
      teamSizeText = `${hackathon.teamSize.min}–${hackathon.teamSize.max} Members`;
    }
  } else if (typeof hackathon.teamSize === "string") {
    teamSizeText = hackathon.teamSize;
  }

  // Prize pool display logic
  let prizeText = "Check official listing";
  if (hackathon.prizePool?.amount != null && hackathon.prizePool.amount > 0) {
    prizeText = `₹${Number(hackathon.prizePool.amount).toLocaleString("en-IN")}`;
  } else if (hackathon.prizePool?.label && hackathon.prizePool.label !== "See listing") {
    prizeText = hackathon.prizePool.label;
  } else if (hackathon.prizes) {
    prizeText = hackathon.prizes;
  }

  const identifier = hackathon.slug || hackathon._id || hackathon.id;

  const handleRegisterClick = () => {
    const targetUrl = hackathon.registrationUrl || hackathon.sourceUrl || hackathon.shareUrl;
    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    } else {
      alert("Registration link is not currently available for this event.");
    }
  };

  return (
    <PageContainer>
      {/* Back button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => navigate("/hackathons")}
          className="text-xs font-semibold text-slate-600 hover:text-blue-600 inline-flex items-center gap-1.5 transition-colors"
        >
          <span className="rotate-180 inline-block">
            <Icon name="arrow" size={13} />
          </span>
          Back to all hackathons
        </button>
      </div>

      {/* Hero & Registration Action Section */}
      <section className="hack-detail-hero">
        <div>
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge tone={getModeTone(hackathon.mode)}>{hackathon.mode || "Online"}</Badge>
            {hackathon.status && (
              <Badge tone={getStatusTone(hackathon.status)}>{hackathon.status}</Badge>
            )}
            {hackathon.isFeatured && <Badge tone="cyan">Featured</Badge>}
            {/* Location Badge */}
            {hackathon.countryCode === "IN" ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                <span>📍</span>
                <span>India{hackathon.city ? ` · ${hackathon.city}` : hackathon.state ? ` · ${hackathon.state}` : ""}</span>
              </span>
            ) : hackathon.locationType === "international" ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-300">
                <span>🌐</span>
                <span>{hackathon.country || "International"}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300">
                <span>❓</span>
                <span>Location Not Specified</span>
              </span>
            )}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                hackathon.isDemo
                  ? "text-amber-800 bg-amber-100"
                  : "text-blue-800 bg-blue-100"
              }`}
            >
              {hackathon.isDemo ? "Demo Listing" : `Source: ${platform}`}
            </span>
          </div>

          <p className="eyebrow">{organizer} presents</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight my-2">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mb-4">
            {hackathon.description}
          </p>

          {/* Categories */}
          <div className="badge-row">
            {categories.map((cat) => (
              <Badge key={cat} tone="neutral">
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action / Registration Card */}
        <div className="register-card card border border-slate-200 shadow-md">
          <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            {hackathon.kind === "contest" ? "Contest Starts" : "Registration Closes"}
          </p>
          <strong className="text-lg text-slate-900 my-1">
            {formatDate(hackathon.registrationDeadline || hackathon.deadline)}
          </strong>
          <small className={isClosed ? "text-slate-400" : "text-emerald-600 font-semibold"}>
            {isClosed ? "Registration has ended" : "Applications currently open"}
          </small>

          <div className="space-y-2 mt-4 w-full">
            {/* 1. Register Now Button (Opens original platform) */}
            <Button
              variant={isClosed ? "secondary" : "primary"}
              onClick={handleRegisterClick}
              disabled={isClosed}
              className="w-full !py-2.5 font-bold justify-center"
            >
              <span>{isClosed ? "Registration Closed" : "Register Now"}</span>
              <Icon name="externalLink" size={14} />
            </Button>

            {/* 2. Save Hackathon Button */}
            <BookmarkButton
              hackathonId={identifier}
              initialBookmarked={isBookmarked}
              onToggle={(saved) => setIsBookmarked(saved)}
              variant="button"
              className="w-full justify-center"
            />

            {/* Official Website Link */}
            {(hackathon.sourceUrl || hackathon.shareUrl) && (
              <button
                type="button"
                onClick={() =>
                  window.open(hackathon.sourceUrl || hackathon.shareUrl, "_blank", "noopener,noreferrer")
                }
                className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 py-1.5 transition-colors inline-flex items-center justify-center gap-1"
              >
                <span>Visit {platform} Listing</span>
                <Icon name="externalLink" size={12} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Details Grid */}
      <div className="detail-grid mt-6">
        {/* Left Column: Full Overview & Eligibility */}
        <section className="card detail-card detail-copy space-y-6 border border-slate-200">
          <div>
            <SectionHeader title="About the Hackathon" />
            <div className="text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line mt-2">
              {hackathon.fullDescription || hackathon.description}
            </div>
          </div>

          <div>
            <SectionHeader title="Eligibility & Criteria" />
            <p className="text-sm text-slate-700 leading-relaxed mt-2">
              {hackathon.eligibility || "Open to all enrolled university students and developers."}
            </p>
          </div>

          {technologies.length > 0 && (
            <div>
              <SectionHeader title="Recommended Technologies & Skills" />
              <div className="flex flex-wrap gap-2 mt-3">
                {technologies.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Brabble Attribution & Source Transparency */}
          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <span>
              Originating Platform: <strong>{platform}</strong> ({hackathon.isDemo ? "Demonstration Record" : "Live Import"})
            </span>
            <span>
              Listing aggregated via{" "}
              <a
                href="https://brabble.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-600 hover:underline"
              >
                Brabble.ai
              </a>
            </span>
          </div>
        </section>

        {/* Right Column: Key Event Facts */}
        <aside className="card detail-card facts border border-slate-200">
          <SectionHeader title="Event Summary" />
          <dl className="mt-3 space-y-3">
            <div>
              <dt className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Icon name="calendar" size={16} />
                Event Date
              </dt>
              <dd className="text-sm font-semibold text-slate-800 mt-1">
                {formatDate(hackathon.startDate || hackathon.date)}
                {hackathon.endDate && ` – ${formatDate(hackathon.endDate)}`}
              </dd>
            </div>

            <div>
              <dt className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Icon name="location" size={16} />
                Format & Venue
              </dt>
              <dd className="text-sm font-semibold text-slate-800 mt-1">
                {hackathon.mode}
                {hackathon.location ? ` · ${hackathon.location}` : ""}
              </dd>
            </div>

            <div>
              <dt className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Icon name="globe" size={16} />
                Geographic Classification
              </dt>
              <dd className="text-sm font-semibold text-slate-800 mt-1">
                {hackathon.countryCode === "IN"
                  ? `🇮🇳 India (${[hackathon.city, hackathon.state].filter(Boolean).join(", ") || "Verified Domestic"})`
                  : hackathon.locationType === "international"
                  ? `🌐 ${hackathon.country || "International"}`
                  : "Location Not Specified / Global"}
              </dd>
            </div>

            <div>
              <dt className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Icon name="team" size={16} />
                Team Configuration
              </dt>
              <dd className="text-sm font-semibold text-slate-800 mt-1">{teamSizeText}</dd>
            </div>

            <div>
              <dt className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Icon name="trophy" size={16} className="text-amber-500" />
                Prize Pool
              </dt>
              <dd className="text-sm font-bold text-slate-900 mt-1">{prizeText}</dd>
            </div>

            <div>
              <dt className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Icon name="building" size={16} />
                Host / Organizer
              </dt>
              <dd className="text-sm font-semibold text-slate-800 mt-1">{organizer}</dd>
            </div>
          </dl>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              onClick={handleRegisterClick}
              disabled={isClosed}
              className="w-full text-xs font-semibold"
            >
              <span>Open on {platform}</span>
              <Icon name="externalLink" size={13} />
            </Button>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}

export default HackathonDetailPage;
