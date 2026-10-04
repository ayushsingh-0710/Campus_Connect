import React from "react";
import Button from "./Button";
import Icon from "./Icon";

export function EmptyState({
  title,
  description,
  icon = "search",
  actionText,
  onAction,
  className = "",
  children,
}) {
  return (
    <div className={`card p-10 text-center flex flex-col items-center justify-center my-6 ${className}`.trim()}>
      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-4">
        <Icon name={icon} size={28} />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">{description}</p>
      {actionText && onAction && (
        <Button variant="secondary" onClick={onAction}>
          {actionText}
        </Button>
      )}
      {children}
    </div>
  );
}

export default EmptyState;
