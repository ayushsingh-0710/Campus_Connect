import React from "react";
import Icon from "./Icon";

export function Button({
  children,
  variant = "primary",
  icon,
  iconPosition = "left",
  onClick,
  type = "button",
  className = "",
  disabled = false,
  loading = false,
  ...rest
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} ${className}`.trim()}
      {...rest}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && iconPosition === "left" && <Icon name={icon} size={17} />
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === "right" && <Icon name={icon} size={17} />}
    </button>
  );
}

export default Button;
