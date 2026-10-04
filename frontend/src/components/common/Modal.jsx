import React, { useEffect } from "react";
import Icon from "./Icon";

export function Modal({
  isOpen,
  onClose,
  title,
  eyebrow = "New workspace",
  children,
  maxWidth = "520px",
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <section
        className="modal"
        style={{ maxWidth }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h2 id="modal-title">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export default Modal;
