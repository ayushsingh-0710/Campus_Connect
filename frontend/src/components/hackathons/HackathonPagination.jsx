import React from "react";
import Button from "../common/Button";
import Icon from "../common/Icon";

export function HackathonPagination({
  currentPage = 1,
  totalPages = 1,
  totalResults = 0,
  limit = 12,
  onPageChange,
  className = "",
}) {
  if (totalResults === 0) return null;

  const startIdx = (currentPage - 1) * limit + 1;
  const endIdx = Math.min(currentPage * limit, totalResults);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-slate-200 mt-8 ${className}`.trim()}
    >
      {/* Results Count */}
      <div className="text-xs text-slate-500 font-medium">
        Showing <span className="font-bold text-slate-800">{startIdx}</span> to{" "}
        <span className="font-bold text-slate-800">{endIdx}</span> of{" "}
        <span className="font-bold text-slate-800">{totalResults}</span> hackathons
      </div>

      {/* Page Navigation */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors inline-flex items-center gap-1.5"
        >
          <span className="rotate-180 inline-block">
            <Icon name="arrow" size={14} />
          </span>
          Previous
        </button>

        <div className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg">
          Page {currentPage} of {totalPages}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors inline-flex items-center gap-1.5"
        >
          Next
          <Icon name="arrow" size={14} />
        </button>
      </div>
    </div>
  );
}

export default HackathonPagination;
