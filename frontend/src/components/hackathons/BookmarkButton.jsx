import React, { useState, useEffect } from "react";
import Icon from "../common/Icon";
import hackathonAPI from "../../services/hackathonAPI";

export function BookmarkButton({
  hackathonId,
  initialBookmarked = false,
  onToggle,
  variant = "icon", // "icon" | "button"
  className = "",
}) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  const handleToggle = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (loading || !hackathonId) return;

    const previousState = isBookmarked;
    // Optimistic update
    setIsBookmarked(!previousState);
    setLoading(true);

    try {
      if (previousState) {
        await hackathonAPI.removeBookmark(hackathonId);
      } else {
        await hackathonAPI.bookmarkHackathon(hackathonId);
      }
      if (onToggle) {
        onToggle(!previousState);
      }
    } catch (err) {
      // Revert on error
      setIsBookmarked(previousState);
      console.error("Failed to toggle bookmark:", err);
    } finally {
      setLoading(false);
    }
  };

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`btn ${
          isBookmarked
            ? "border-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        } ${className}`}
        aria-label={isBookmarked ? "Remove from bookmarks" : "Save hackathon"}
        title={isBookmarked ? "Saved to your bookmarks" : "Save hackathon"}
      >
        <span className={isBookmarked ? "text-blue-600" : "text-slate-400"}>
          <Icon name={isBookmarked ? "bookmarkFilled" : "bookmark"} size={17} />
        </span>
        <span>{isBookmarked ? "Saved" : "Save Hackathon"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-xl transition-all duration-150 flex items-center justify-center ${
        isBookmarked
          ? "bg-blue-50 text-blue-600 border border-blue-200"
          : "bg-white/80 hover:bg-white text-slate-400 hover:text-slate-700 border border-slate-200/80 shadow-xs"
      } ${className}`}
      aria-label={isBookmarked ? "Remove from bookmarks" : "Save hackathon"}
      title={isBookmarked ? "Saved to bookmarks" : "Save hackathon"}
    >
      <Icon name={isBookmarked ? "bookmarkFilled" : "bookmark"} size={17} />
    </button>
  );
}

export default BookmarkButton;
