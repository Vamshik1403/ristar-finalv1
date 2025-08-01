"use client";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";
import { ReactNode, memo } from "react";

type Props = ThemeProviderProps & { children: ReactNode };

const OptimizedThemeProvider = memo(function OptimizedThemeProvider({ children, ...props }: Props) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
});

export function ThemeProvider({ children, ...props }: Props) {
  return <OptimizedThemeProvider {...props}>{children}</OptimizedThemeProvider>;
}
