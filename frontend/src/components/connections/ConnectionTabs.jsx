import React from "react";

export function ConnectionTabs({
  activeTab,
  onTabChange,
  connectionsCount,
  pendingCount,
}) {
  return (
    <div className="tabs">
      <button
        type="button"
        className={activeTab === "mine" ? "active" : ""}
        onClick={() => onTabChange("mine")}
      >
        My connections <span>{connectionsCount}</span>
      </button>
      <button
        type="button"
        className={activeTab === "pending" ? "active" : ""}
        onClick={() => onTabChange("pending")}
      >
        Pending requests <span>{pendingCount}</span>
      </button>
    </div>
  );
}

export default ConnectionTabs;
