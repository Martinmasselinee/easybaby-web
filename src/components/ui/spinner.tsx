"use client";

import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-3",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-t-transparent border-primary",
        sizeClasses[size],
        className
      )}
    >
      <span className="sr-only">Chargement...</span>
    </div>
  );
}

interface LoadingOverlayProps {
  message?: string;
  isFullScreen?: boolean;
}

export function LoadingOverlay({ message = "Chargement...", isFullScreen = false }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-white/80 z-50",
        isFullScreen ? "fixed inset-0" : "absolute inset-0"
      )}
    >
      <Spinner size="lg" />
      <p className="mt-4 text-sm font-medium text-gray-700">{message}</p>
    </div>
  );
}

interface ButtonSpinnerProps {
  className?: string;
}

export function ButtonSpinner({ className }: ButtonSpinnerProps) {
  return <Spinner size="sm" className={cn("mr-2", className)} />;
}
