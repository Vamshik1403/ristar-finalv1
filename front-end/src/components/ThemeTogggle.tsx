"use client";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={`
        relative flex items-center justify-center w-12 h-12 rounded-full
        border-2 border-neutral-300 dark:border-neutral-600
        bg-white dark:bg-neutral-800
        hover:bg-gradient-to-br hover:from-neutral-50 hover:to-neutral-100 
        dark:hover:from-neutral-700 dark:hover:to-neutral-800
        hover:border-neutral-400 dark:hover:border-neutral-500
        focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-900
        transition-all duration-300 ease-out
        hover:shadow-xl dark:hover:shadow-2xl
        hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50
        hover:scale-110 active:scale-95
        hover:-translate-y-1
        group
        overflow-hidden
        before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] before:transition-transform before:duration-700 before:ease-out
        hover:before:translate-x-[100%] cursor-pointer
      `}
    >
      <div className="relative w-6 h-6">
        <Sun 
          className={`
            absolute inset-0 w-6 h-6 text-amber-500 dark:text-amber-400
            transition-all duration-500 ease-out
            ${resolvedTheme === "dark" ? 'opacity-0 rotate-180 scale-50 translate-y-2' : 'opacity-100 rotate-0 scale-100 translate-y-0'}
            group-hover:scale-125 group-hover:rotate-12
            group-hover:text-amber-600 dark:group-hover:text-amber-300
            drop-shadow-sm
          `}
        />
        <Moon 
          className={`
            absolute inset-0 w-6 h-6 text-slate-600 dark:text-slate-300
            transition-all duration-500 ease-out
            ${resolvedTheme === "dark" ? 'opacity-100 rotate-0 scale-100 translate-y-0' : 'opacity-0 -rotate-180 scale-50 -translate-y-2'}
            group-hover:scale-125 group-hover:-rotate-12
            group-hover:text-slate-700 dark:group-hover:text-slate-200
            drop-shadow-sm
          `}
        />
      </div>
      
      {/* Glow effect */}
      <div className={`
        absolute inset-0 rounded-full opacity-0 group-hover:opacity-100
        transition-opacity duration-300 ease-out
        ${resolvedTheme === "dark" ? 'bg-gradient-to-r from-slate-400/20 to-slate-600/20' : 'bg-gradient-to-r from-amber-400/20 to-orange-400/20'}
        blur-sm
      `} />
    </button>
  );
}
