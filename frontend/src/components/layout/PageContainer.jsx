import React from "react";

export function PageContainer({ children, className = "" }) {
  return <main className={`page ${className}`.trim()}>{children}</main>;
}

export default PageContainer;
