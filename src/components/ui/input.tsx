import * as React from "react";
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={["h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-black/10", className].join(" ")}
      {...props}
    />
  )
);
Input.displayName = "Input";
