import React from "react";
import Icon from "../common/Icon";
import Button from "../common/Button";

export function HackathonEmptyState({
  title = "No hackathons found",
  description = "Try adjusting your search terms or clearing some filters to see available opportunities.",
  actionText = "Clear all filters",
  onAction,
  icon = "search",
}) {
  return (
    <div className="card text-center py-16 px-6 max-w-xl mx-auto my-8 border-dashed border-2 border-slate-200">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
        <Icon name={icon} size={32} />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">{description}</p>
      {onAction && (
        <Button variant="secondary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}

export default HackathonEmptyState;
