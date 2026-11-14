import React from "react";
import HackathonCard from "./HackathonCard";

export function HackathonGrid({
  hackathons = [],
  className = "",
  onViewHackathon,
  bookmarkedIds = new Set(),
  onBookmarkToggle,
}) {
  return (
    <div className={`hack-grid ${className}`.trim()}>
      {hackathons.map((h) => {
        const id = h.slug || h._id || h.id;
        const isBookmarked = bookmarkedIds.has(id) || bookmarkedIds.has(h._id) || Boolean(h.isBookmarked);

        return (
          <HackathonCard
            key={h._id || h.slug || h.id}
            hackathon={h}
            isBookmarked={isBookmarked}
            onBookmarkToggle={() => onBookmarkToggle && onBookmarkToggle(id)}
            onView={onViewHackathon ? () => onViewHackathon(h) : undefined}
          />
        );
      })}
    </div>
  );
}

export default HackathonGrid;
