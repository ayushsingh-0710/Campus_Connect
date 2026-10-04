import React, { useRef, useEffect } from "react";

export function Dropdown({
  isOpen,
  onClose,
  children,
  className = "",
  align = "right",
}) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={`dropdown ${align === "left" ? "left-0" : "right-0"} ${className}`.trim()}
      role="menu"
    >
      {children}
    </div>
  );
}

export default Dropdown;
