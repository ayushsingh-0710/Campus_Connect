import React from "react";
import Badge from "../common/Badge";
import Button from "../common/Button";
import Icon from "../common/Icon";
import { useNavigate } from "../../routes/Router";

export function FeaturedHackathon({ hackathon, loading = false }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="card feature-callout animate-pulse my-6 min-h-[180px]">
        <div className="space-y-3 w-2/3">
          <div className="w-32 h-6 bg-white/20 rounded-full" />
          <div className="w-3/4 h-8 bg-white/20 rounded-lg" />
          <div className="w-5/6 h-4 bg-white/20 rounded" />
          <div className="w-28 h-9 bg-white/20 rounded-lg mt-4" />
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return null;
  }

  const identifier = hackathon.slug || hackathon._id || hackathon.id;

  const formatDate = (dateString) => {
    if (!dateString) return "Date: Not specified";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  let prizeDisplay = "Check official listing";
  if (hackathon.prizePool?.amount != null && hackathon.prizePool.amount > 0) {
    prizeDisplay = `₹${Number(hackathon.prizePool.amount).toLocaleString("en-IN")}`;
  } else if (hackathon.prizePool?.label && hackathon.prizePool.label !== "See listing") {
    prizeDisplay = hackathon.prizePool.label;
  } else if (hackathon.prizes) {
    prizeDisplay = hackathon.prizes;
  }

  return (
    <section className="feature-callout relative overflow-hidden my-6">
      <div className="relative z-10 max-w-2xl">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge tone="cyan">⭐ Featured Opportunity</Badge>
          <span className="text-xs text-cyan-200 font-semibold uppercase tracking-wider">
            by {hackathon.organizer}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          {hackathon.title || hackathon.name}
        </h2>

        <p className="text-sm sm:text-base text-slate-200 line-clamp-2 mb-4 leading-relaxed">
          {hackathon.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-cyan-100 mb-5">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="calendar" size={15} />
            {formatDate(hackathon.startDate || hackathon.date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="trophy" size={15} />
            {prizeDisplay}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="location" size={15} />
            {hackathon.mode || "Online"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate(`/hackathons/${identifier}`)}
            className="!bg-blue-600 hover:!bg-blue-700 !text-white font-bold"
          >
            Explore Featured Hackathon
            <Icon name="arrow" size={15} />
          </Button>
        </div>
      </div>

      <div className="feature-symbol opacity-40 sm:opacity-90">
        <Icon name="spark" size={68} />
      </div>
    </section>
  );
}

export default FeaturedHackathon;
