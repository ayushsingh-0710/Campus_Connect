import React from "react";
import SectionHeader from "../layout/SectionHeader";

export function ProfileSection({
  title,
  children,
  className = "",
  action,
  onAction,
}) {
  return (
    <section className={`card detail-card ${className}`.trim()}>
      <SectionHeader title={title} action={action} onAction={onAction} />
      {children}
    </section>
  );
}

export default ProfileSection;
