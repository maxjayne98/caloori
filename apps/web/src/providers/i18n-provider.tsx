'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type Locale,
  type Direction,
  LOCALE_METADATA,
  t as coreTranslate,
  translateMealName,
  type TranslationKey,
  formatDate as coreFormatDate,
  formatCompact as coreFormatCompact,
} from '@nourish/core';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dir: Direction;
  isRtl: boolean;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  tMeal: (meal: string) => string;
  formatDate: (date: string | Date, options?: Intl.DateTimeFormatOptions) => string;
  formatCompact: (value: number) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  dir: 'ltr',
  isRtl: false,
  t: (key, params) => coreTranslate(DEFAULT_LOCALE, key, params),
  tMeal: (meal) => translateMealName(meal, DEFAULT_LOCALE),
  formatDate: (date, options) => coreFormatDate(date, DEFAULT_LOCALE, options),
  formatCompact: (value) => coreFormatCompact(value, DEFAULT_LOCALE),
});

const STORAGE_KEY = 'nourish-next:locale';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [hasRestoredLocale, setHasRestoredLocale] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale;
      if (stored && (SUPPORTED_LOCALES as readonly string[]).includes(stored)) {
        setLocaleState(stored);
      }
    } catch {
      // Storage unavailable fallback
    }
    setHasRestoredLocale(true);
  }, []);

  useEffect(() => {
    if (!hasRestoredLocale) return;

    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // Storage unavailable fallback
    }
    const meta = LOCALE_METADATA[locale] || LOCALE_METADATA[DEFAULT_LOCALE];
    document.documentElement.lang = locale;
    document.documentElement.dir = meta.dir;
  }, [hasRestoredLocale, locale]);

  function setLocale(next: Locale) {
    if ((SUPPORTED_LOCALES as readonly string[]).includes(next)) {
      setLocaleState(next);
    }
  }

  const dir = LOCALE_METADATA[locale]?.dir || 'ltr';
  const isRtl = dir === 'rtl';

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        dir,
        isRtl,
        t: (key, params) => coreTranslate(locale, key, params),
        tMeal: (meal) => translateMealName(meal, locale),
        formatDate: (date, options) => coreFormatDate(date, locale, options),
        formatCompact: (value) => coreFormatCompact(value, locale),
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
