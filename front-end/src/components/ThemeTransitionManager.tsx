"use client";
import { useEffect, useRef } from "react";
import { useOptimizedTheme } from "@/hooks/useOptimizedTheme";

export function ThemeTransitionManager() {
  const { theme } = useOptimizedTheme();
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    const handleThemeChange = () => {
      if (isTransitioningRef.current) return;
      
      isTransitioningRef.current = true;
      
      // Remove transition class immediately after theme change
      requestAnimationFrame(() => {
        document.body.classList.remove('theme-transitioning');
        isTransitioningRef.current = false;
      });
    };

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target as HTMLElement;
          if (target.classList.contains('dark') || !target.classList.contains('dark')) {
            handleThemeChange();
          }
        }
      });
    });

    // Observe the html element for class changes
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      observer.disconnect();
    };
  }, [theme]);

  return null; // This component doesn't render anything
} 