export type Locale = 'CA' | 'US'

export const localeConfig = {
  CA: {
    country: 'Canada',
    currency: 'CAD',
    currencySymbol: 'CA$',
    postalCodeLabel: 'Postal Code',
    postalCodePlaceholder: 'A1A 1A1',
    postalCodeRegex: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
    provinceStateLabel: 'Province',
    provinceStateOptions: [
      'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
      'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
      'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec',
      'Saskatchewan', 'Yukon'
    ],
    driversLicenseClasses: [
      'G (Ontario)', 'G2 (Ontario)', 'Class 5 (BC/AB/SK/MB)',
      'Class 7 (BC/AB)', 'Class 5 Novice (MB)', 'Class 4 (MB)',
      'Class 5 (NS/NB/PEI/NL)', 'Probationary (QC)', 'Other'
    ],
    phoneFormat: '+1 (___) ___-____',
    backgroundCheckLabel: 'Vulnerable Sector Check',
    backgroundCheckDescription: 'Required for working with vulnerable populations in Canada',
    privacyLaw: 'PIPEDA',
    complianceDeclaration: 'I consent to a Vulnerable Sector Check as required under Canadian law for working with vulnerable populations.',
    callingComplianceLabel: 'CRTC Compliance',
    defaultTimezone: 'America/Toronto',
    distanceUnit: 'km',
    distanceOptions: ['5 km', '10 km', '20 km', '30 km', '50 km', '100 km+', 'No limit'],
  },
  US: {
    country: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    postalCodeLabel: 'ZIP Code',
    postalCodePlaceholder: '12345',
    postalCodeRegex: /^\d{5}(-\d{4})?$/,
    provinceStateLabel: 'State',
    provinceStateOptions: [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
      'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
      'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
      'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
      'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
      'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
      'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
      'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
      'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
      'West Virginia', 'Wisconsin', 'Wyoming'
    ],
    driversLicenseClasses: [
      'Class C (standard)', 'Class B', 'Class A',
      'Motorcycle (M)', 'CDL Class A', 'CDL Class B', 'Other'
    ],
    phoneFormat: '+1 (___) ___-____',
    backgroundCheckLabel: 'Background Check',
    backgroundCheckDescription: 'Required for working with vulnerable populations',
    privacyLaw: 'HIPAA',
    complianceDeclaration: 'I consent to a background check as required for working with vulnerable populations.',
    callingComplianceLabel: 'TCPA Compliance',
    defaultTimezone: 'America/Chicago',
    distanceUnit: 'miles',
    distanceOptions: ['5 miles', '10 miles', '20 miles', '30 miles', '50 miles', '100 miles+', 'No limit'],
  }
} as const

export type LocaleConfig = typeof localeConfig[Locale]

export function getLocaleConfig(locale: Locale): LocaleConfig {
  return localeConfig[locale]
}