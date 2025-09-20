import * as React from "react";
import { cn } from "@/lib/utils";

// Simple Spinner Component
interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-6 w-6", 
      lg: "h-8 w-8"
    };

    return (
      <div
        ref={ref}
        className={cn("animate-spin", sizeClasses[size], className)}
        {...props}
      >
        <svg
          className="h-full w-full text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }
);
Spinner.displayName = "Spinner";

// Loading Component
interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size = "md", text, fullScreen = false, ...props }, ref) => {
    const containerClasses = cn(
      "flex flex-col items-center justify-center gap-3",
      {
        "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm": fullScreen,
      },
      className
    );

    return (
      <div ref={ref} className={containerClasses} {...props}>
        <Spinner size={size} />
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {text}
          </p>
        )}
      </div>
    );
  }
);
Loading.displayName = "Loading";

// Button Loading Component
interface ButtonLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
}

const ButtonLoading = React.forwardRef<HTMLDivElement, ButtonLoadingProps>(
  ({ className, text = "Loading...", ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn("flex items-center gap-2", className)} 
      {...props}
    >
      <Spinner size="sm" />
      <span>{text}</span>
    </div>
  )
);
ButtonLoading.displayName = "ButtonLoading";

// Simple Skeleton Component
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, lines = 3, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 bg-muted rounded animate-pulse",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  )
);
Skeleton.displayName = "Skeleton";

export { 
  Loading, 
  ButtonLoading, 
  Skeleton, 
  Spinner
};
