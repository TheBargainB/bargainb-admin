"use client";

import { cn } from "@/lib/utils";
import React from "react";

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "100px",
      background = "rgba(0, 0, 0, 1)",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={{
          "--shimmer-color": shimmerColor,
          "--shimmer-size": shimmerSize,
          "--shimmer-duration": shimmerDuration,
          "--border-radius": borderRadius,
          "--background": background,
        } as React.CSSProperties}
        className={cn(
          "relative overflow-hidden rounded-lg px-6 py-2 transition-all duration-300",
          "bg-[--background] text-white",
          "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer",
          "before:bg-gradient-to-r before:from-transparent before:via-[--shimmer-color] before:to-transparent",
          "before:opacity-60 before:transition-transform before:duration-1000",
          "hover:shadow-lg",
          className
        )}
        ref={ref}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton"; 