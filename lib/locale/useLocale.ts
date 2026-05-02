'use client'
import { localeConfig, Locale, LocaleConfig } from './config'

export function useLocale(): { locale: Locale; config: LocaleConfig } {
  const locale = (process.env.NEXT_PUBLIC_LOCALE as Locale) ?? 'CA'
  return {
    locale,
    config: localeConfig[locale]
  }
}