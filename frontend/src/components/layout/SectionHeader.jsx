import React from "react";
import Icon from "../common/Icon";

export function SectionHeader({
  title,
  action,
  onAction,
  className = "",
}) {
  return (
    <div className={`section-heading ${className}`.trim()}>
      <div>
        <h2>{title}</h2>
      </div>
      {action && (
        <button type="button" onClick={onAction}>
          {action}
          <Icon name="arrow" size={16} />
        </button>
      )}
    </div>
  );
}

export default SectionHeader;
