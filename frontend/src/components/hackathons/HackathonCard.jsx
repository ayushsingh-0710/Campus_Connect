import React from "react";
import Badge from "../common/Badge";
import Button from "../common/Button";
import Icon from "../common/Icon";
import BookmarkButton from "./BookmarkButton";
import { useNavigate } from "../../routes/Router";

export function HackathonCard({
  hackathon,
  onView,
  isBookmarked = false,
  onBookmarkToggle,
  className = "",
}) {
  const navigate = useNavigate();

  const identifier = hackathon.slug || hackathon._id || hackathon.id;

  const handleView = () => {
    if (onView) {
      onView(hackathon);
    } else {
      navigate(`/hackathons/${identifier}`);
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Not specified";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const formatDeadline = (dateString) => {
    if (!dateString) return "Not specified";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Not specified";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const title = hackathon.title || hackathon.name || "Untitled Hackathon";
  const organizer = hackathon.organizer || "Campus Partner";
  const description = hackathon.description || "";
  const categories = hackathon.categories || hackathon.skills || [];
  const platform = hackathon.platform || (hackathon.isDemo ? "Demo" : "Brabble");

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

  // Prize pool display logic: never show ₹0 if amount is null
  let prizeText = "Check official listing";
  if (hackathon.prizePool?.amount != null && hackathon.prizePool.amount > 0) {
    prizeText = `₹${Number(hackathon.prizePool.amount).toLocaleString("en-IN")}`;
  } else if (hackathon.prizePool?.label && hackathon.prizePool.label !== "See listing") {
    prizeText = hackathon.prizePool.label;
  } else if (hackathon.prizes) {
    prizeText = hackathon.prizes;
  }

  const isClosed = hackathon.status === "Closed";

  return (
    <article
      className={`card hack-card group hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between border border-slate-200 hover:border-blue-300 hover:shadow-lg bg-white relative ${className}`.trim()}
    >
      <div>
        {/* Top: Logo/Icon + Badges + Bookmark Button */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {hackathon.logo ? (
              <img
                src={hackathon.logo}
                alt={`${title} logo`}
                className="w-11 h-11 rounded-xl object-cover border border-slate-100 shadow-xs"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = "none";
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = "flex";
                  }
                }}
              />
            ) : null}
            <div
              className={`w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 ${
                hackathon.logo ? "hidden" : "flex"
              }`}
            >
              <Icon name="code" size={22} />
            </div>

            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[170px]" title={organizer}>
                {organizer}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge tone={getModeTone(hackathon.mode)}>
                  {hackathon.mode || "Online"}
                </Badge>
                {hackathon.status && (
                  <Badge tone={getStatusTone(hackathon.status)}>
                    {hackathon.status}
                  </Badge>
                )}
                {/* Location Badge */}
                {hackathon.countryCode === "IN" ? (
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"
                    title={hackathon.city ? `${hackathon.city}, ${hackathon.state || "India"}` : "Verified Indian Opportunity"}
                  >
                    <span>📍</span>
                    <span>IN{hackathon.city ? ` · ${hackathon.city}` : hackathon.state ? ` · ${hackathon.state}` : ""}</span>
                  </span>
                ) : hackathon.locationType === "international" ? (
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full"
                    title={hackathon.country || "International"}
                  >
                    <span>🌐</span>
                    <span>{hackathon.country || "International"}</span>
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-full"
                    title="Location Not Specified"
                  >
                    <span>❓</span>
                    <span>Unspecified</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <BookmarkButton
            hackathonId={identifier}
            initialBookmarked={isBookmarked}
            onToggle={onBookmarkToggle}
          />
        </div>

        {/* Title */}
        <div className="cursor-pointer mb-2" onClick={handleView}>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1" title={title}>
            {title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Category Tags */}
        <div className="flex flex-wrap gap-1.5 my-3">
          {categories.slice(0, 3).map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
            >
              {cat}
            </span>
          ))}
          {categories.length > 3 && (
            <span className="text-[10px] text-slate-400 self-center">
              +{categories.length - 3} more
            </span>
          )}
        </div>

        {/* Key Metrics: Team Size & Prize Pool */}
        <div className="grid grid-cols-2 gap-2 py-2.5 my-2 border-y border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Icon name="team" size={15} className="text-slate-400 shrink-0" />
            <span className="truncate" title={teamSizeText}>{teamSizeText}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
            <Icon name="trophy" size={15} className="text-amber-500 shrink-0" />
            <span className="truncate" title={prizeText}>{prizeText}</span>
          </div>
        </div>

        {/* Event Date & Deadline */}
        <div className="space-y-1 text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-1.5">
            <Icon name="calendar" size={14} className="text-slate-400" />
            <span>Event: {formatDate(hackathon.startDate || hackathon.date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icon name="clock" size={14} className={isClosed ? "text-slate-400" : "text-amber-600"} />
            <span className={isClosed ? "text-slate-400 line-through" : "text-slate-700 font-medium"}>
              Deadline: {formatDeadline(hackathon.registrationDeadline || hackathon.deadline)}
            </span>
          </div>
        </div>
      </div>

      {/* Card Actions: Source attribution + View Details */}
      <div className="card-actions pt-2 border-t border-slate-100 flex items-center justify-between">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
            hackathon.isDemo
              ? "text-amber-700 bg-amber-50 border-amber-200"
              : "text-slate-600 bg-slate-50 border-slate-200"
          }`}
          title={`Originating platform: ${platform}`}
        >
          {hackathon.isDemo ? "DEMO" : `Source: ${platform}`}
        </span>

        <Button
          variant="secondary"
          onClick={handleView}
          className="ml-auto !text-xs !py-1.5 !px-3 font-semibold group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200"
        >
          View Details
          <Icon name="arrow" size={13} />
        </Button>
      </div>
    </article>
  );
}

export default HackathonCard;
