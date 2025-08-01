"use client";
import { useTheme } from "next-themes";
import { useCallback, useMemo } from "react";

export function useOptimizedTheme() {
  const { resolvedTheme, setTheme, systemTheme } = useTheme();

  const isDark = useMemo(() => resolvedTheme === "dark", [resolvedTheme]);
  const isLight = useMemo(() => resolvedTheme === "light", [resolvedTheme]);
  const isSystem = useMemo(() => resolvedTheme === "system", [resolvedTheme]);

  const toggleTheme = useCallback(() => {
    if (isDark) {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  }, [isDark, setTheme]);

  const setDarkTheme = useCallback(() => {
    setTheme("dark");
  }, [setTheme]);

  const setLightTheme = useCallback(() => {
    setTheme("light");
  }, [setTheme]);

  const setSystemTheme = useCallback(() => {
    setTheme("system");
  }, [setTheme]);

  return {
    theme: resolvedTheme,
    systemTheme,
    isDark,
    isLight,
    isSystem,
    toggleTheme,
    setDarkTheme,
    setLightTheme,
    setSystemTheme,
    setTheme,
  };
} 