const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
// Omits I, O, 0, 1 — avoids visual confusion

function generateSlug(length = 5): string {
  return Array.from(
    { length },
    () => CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join('')
}

export function generateCaregiverCode(
  country: string,
  state: string
): { code: string; slug: string } {
  const countryCode = (country || 'US').toUpperCase().slice(0, 2)
  const stateCode = (state || 'TX').toUpperCase().slice(0, 2)
  const year = new Date().getFullYear()
  const slug = generateSlug(5)
  const code = `CRF-${countryCode}-${stateCode}-${year}-${slug}`
  return { code, slug }
}