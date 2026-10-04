import React from "react";
import Button from "./Button";
import Icon from "./Icon";

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this content. Please try again or check back later.",
  onRetry,
  className = "",
}) {
  return (
    <div className={`card p-10 text-center flex flex-col items-center justify-center my-6 border-red-200 bg-red-50/30 ${className}`.trim()}>
      <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-500 flex items-center justify-center mb-4">
        <Icon name="close" size={28} />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 max-w-md mx-auto mb-5">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
