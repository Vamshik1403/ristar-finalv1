"use client";
import { memo, ReactNode } from "react";

interface MemoizedThemeWrapperProps {
  children: ReactNode;
  className?: string;
}

export const MemoizedThemeWrapper = memo(function MemoizedThemeWrapper({ 
  children, 
  className = "" 
}: MemoizedThemeWrapperProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}); 