import React, { forwardRef, useState } from "react";

const Input = forwardRef(({ label, error, className = "", type = "text", ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="w-full relative">
      {label && (
        <label htmlFor={props.id || props.name} className="block text-white mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={isPassword ? (showPassword ? "text" : "password") : type}
        className={`w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${className} ${error ? 'border-red-400' : ''} ${isPassword ? 'pr-12' : ''}`}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          tabIndex={0}
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((v) => !v)}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-white/70 hover:text-white focus:outline-none"
        >
          {showPassword ? (
            // Eye-off icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7c1.13 0 2.21.19 3.22.54M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.39 4.56A8.96 8.96 0 0021 12c0-1.61-.41-3.13-1.13-4.44M4.22 4.22l15.56 15.56" />
            </svg>
          ) : (
            // Eye icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 3-4 7-9 7s-9-4-9-7 4-7 9-7 9 4 9 7z" />
            </svg>
          )}
        </button>
      )}
      {error && <div className="mt-1 text-sm text-red-400">{error}</div>}
    </div>
  );
});

export default Input; 