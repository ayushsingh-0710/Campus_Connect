import React from "react";

export function HackathonSkeleton({ count = 6 }) {
  return (
    <div className="hack-grid">
      {Array.from({ length: count }).map((_, i) => (
        <article key={i} className="card hack-card animate-pulse">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-slate-200" />
            <div className="w-20 h-6 rounded-full bg-slate-200" />
          </div>

          {/* Title & Organizer */}
          <div className="space-y-2 mt-1">
            <div className="w-3/4 h-5 rounded bg-slate-200" />
            <div className="w-1/2 h-3 rounded bg-slate-200" />
          </div>

          {/* Description */}
          <div className="space-y-1.5 py-1">
            <div className="w-full h-3 rounded bg-slate-200" />
            <div className="w-5/6 h-3 rounded bg-slate-200" />
          </div>

          {/* Tags */}
          <div className="flex gap-2">
            <div className="w-16 h-5 rounded-full bg-slate-200" />
            <div className="w-20 h-5 rounded-full bg-slate-200" />
          </div>

          {/* Meta rows */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <div className="w-24 h-3 rounded bg-slate-200" />
            <div className="w-24 h-3 rounded bg-slate-200" />
          </div>

          {/* Actions */}
          <div className="card-actions pt-2 mt-auto">
            <div className="w-24 h-3 rounded bg-slate-200" />
            <div className="w-24 h-9 rounded-lg bg-slate-200" />
          </div>
        </article>
      ))}
    </div>
  );
}

export default HackathonSkeleton;
