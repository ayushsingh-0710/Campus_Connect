import React from "react";
import Icon from "./Icon";

export function Logo({ compact = false, className = "" }) {
  return (
    <div className={`logo-lockup ${className}`.trim()}>
      <span className="logo-mark">
        <Icon name="people" size={21} />
      </span>
      {!compact && <span>Campus Connect</span>}
    </div>
  );
}

export default Logo;
