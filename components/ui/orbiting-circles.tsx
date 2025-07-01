"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import React from "react";

export interface OrbitingCirclesProps {
  className?: string;
  children?: React.ReactNode;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
  iconSize?: number;
  speed?: number;
}

export const OrbitingCircles = ({
  className,
  children,
  reverse = false,
  duration = 20,
  delay = 10,
  radius = 160,
  path = true,
  iconSize = 30,
  speed = 1,
}: OrbitingCirclesProps) => {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Path circle if enabled */}
      {path && (
        <div
          className="absolute inset-0 rounded-full border border-neutral-200/50 dark:border-neutral-800/50"
          style={{
            width: radius * 2,
            height: radius * 2,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
      
      {React.Children.map(children, (child, index) => {
        return (
          <motion.div
            key={index}
            className={cn(
              "absolute flex items-center justify-center",
              className
            )}
            style={{
              width: iconSize,
              height: iconSize,
            }}
            animate={{
              rotate: reverse ? -360 : 360,
            }}
            transition={{
              duration: duration / speed,
              repeat: Infinity,
              ease: "linear",
              delay: delay * index,
            }}
            transformTemplate={({ rotate }) => {
              const rotateValue = rotate || "0deg";
              return `rotate(${rotateValue}) translateX(${radius}px) rotate(${reverse ? rotateValue : `-${rotateValue}`})`;
            }}
          >
            {child}
          </motion.div>
        );
      })}
    </div>
  );
}; 