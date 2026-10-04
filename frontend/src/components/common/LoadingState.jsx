import React from "react";

export function LoadingState({
  message = "Loading campus network...",
  className = "",
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`.trim()}>
      <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
}

export default LoadingState;
