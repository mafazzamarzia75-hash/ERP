import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "default" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  default: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-3",
};

export function Spinner({ className, size = "default" }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-current border-t-transparent",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Memuat..."
    />
  );
}