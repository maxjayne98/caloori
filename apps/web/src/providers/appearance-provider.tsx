'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider, useTheme } from 'next-themes';
export const ACCENTS = {
  pink: '#ff375f',
  blue: '#0a84ff',
  purple: '#af52de',
  green: '#248a3d',
  orange: '#c93400',
  teal: '#00838f',
} as const;
export type Accent = keyof typeof ACCENTS;
const AccentContext = createContext({
  accent: 'pink' as Accent,
  setAccent: (_value: Accent) => {},
});
function AccentProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((meta) =>
        meta.setAttribute('content', resolvedTheme === 'dark' ? '#18181c' : '#f5f5f7'),
      );
  }, [resolvedTheme]);
  const [accent, setAccent] = useState<Accent>('pink');
  useEffect(() => {
    const value = localStorage.getItem('nourish-next:accent');
    if (value && value in ACCENTS) setAccent(value as Accent);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.accent = accent;
    localStorage.setItem('nourish-next:accent', accent);
  }, [accent]);
  return <AccentContext.Provider value={{ accent, setAccent }}>{children}</AccentContext.Provider>;
}
export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <AccentProvider>{children}</AccentProvider>
    </ThemeProvider>
  );
}
export function useAppearance() {
  return { ...useTheme(), ...useContext(AccentContext) };
}
