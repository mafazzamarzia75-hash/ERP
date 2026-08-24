import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type BadgeVariant = "default" | "success" | "warning" | "destructive" | "outline";

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  destructive: "bg-red-100 text-red-700",
  outline: "border border-input text-foreground",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}