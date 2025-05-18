import React, { forwardRef } from "react";

const Switch = forwardRef(({ checked, onChange, disabled = false, className = "", ...props }, ref) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      ref={ref}
      tabIndex={0}
      disabled={disabled}
      onClick={() => !disabled && onChange && onChange(!checked)}
      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 border border-white/20 bg-white/10 ${checked ? 'bg-blue-500' : 'bg-white/10'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      {...props}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`}
      />
    </button>
  );
});

export default Switch; 