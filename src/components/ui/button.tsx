import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-2xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-10 px-4 py-2 shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-black text-white hover:opacity-90",
        outline: "border border-neutral-300 bg-white hover:bg-neutral-50",
        ghost: "hover:bg-neutral-100",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3",
        lg: "h-11 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={[buttonVariants({ variant, size }), className].join(" ")}
      {...props}
    />
  )
);
Button.displayName = "Button";
