import React from "react";

export function Badge({ children, tone = "blue", className = "", onClick }) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`badge badge-${tone} cursor-pointer transition-opacity hover:opacity-85 ${className}`.trim()}
      >
        {children}
      </button>
    );
  }

  return <span className={`badge badge-${tone} ${className}`.trim()}>{children}</span>;
}

export default Badge;
