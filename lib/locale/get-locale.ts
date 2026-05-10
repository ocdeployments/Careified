// Get current locale from environment
// Used to scope all database queries to the current deployment region

export function getLocale(): string {
  return process.env.NEXT_PUBLIC_LOCALE || 'CA'
}

export const LOCALE_CA = 'CA'
export const LOCALE_US = 'US'