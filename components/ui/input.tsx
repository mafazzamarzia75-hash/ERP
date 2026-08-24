"use client";

import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="w-full space-y-1.5">
      {label ? (
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none text-foreground"
        >
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={id}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-destructive" : "",
          className
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  )
);
Input.displayName = "Input";