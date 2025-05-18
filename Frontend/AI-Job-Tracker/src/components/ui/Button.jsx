import React, { forwardRef } from "react";

const Button = forwardRef(({ children, loading, className = "", ...props }, ref) => (
  <button
    ref={ref}
    className={`w-full bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-colors font-semibold disabled:opacity-60 flex items-center justify-center ${className}`}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading && (
      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
    )}
    {children}
  </button>
));

export default Button; 