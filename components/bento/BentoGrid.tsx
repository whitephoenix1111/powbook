"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export default function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-4 gap-3 auto-rows-[200px]",
        className
      )}
    >
      {children}
    </div>
  );
}
