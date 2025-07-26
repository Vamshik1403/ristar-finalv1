"use client";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`
        relative flex items-center justify-center w-10 h-10 rounded-full
        border border-neutral-300 dark:border-neutral-600
        bg-white dark:bg-neutral-800
        hover:bg-neutral-50 dark:hover:bg-neutral-700
        hover:border-neutral-400 dark:hover:border-neutral-500
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900
        transition-all duration-200 ease-in-out
        hover:shadow-sm dark:hover:shadow-none
        active:scale-90 active:rotate-180
        hover:rotate-180
        group
      `}
    >
      {isDark ? (
        <Sun 
          className="w-5 h-5 text-neutral-600 dark:text-neutral-300 transition-all duration-300 group-hover:rotate-180 group-active:scale-110 cursor-pointer" 
        />
      ) : (
        <Moon 
          className="w-5 h-5 text-neutral-600 dark:text-neutral-300 transition-all duration-300 group-hover:rotate-180 group-active:scale-110 cursor-pointer" 
        />
      )}
    </button>
  );
}
