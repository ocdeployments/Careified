// Careified — Search Types — Session 5

export interface SearchFilters {
 // Location
 city?: string;
 state?: string;
 radius?: number;
 // Availability
 availabilityStatus?: string;
 placementTypes: string[];
 daysAvailable?: string[];
 shiftTypes?: string[];
 minHoursPerWeek?: number;
 maxHoursPerWeek?: number;
 holidayAvailable?: boolean;
 openToUrgent?: boolean;
 // Skills
 specialties: string[];
 credentials: string[];
 languages?: string[];
 minExperience?: number;
 maxExperience?: number;
 // Logistics
 hasVehicle?: boolean;
 hasDriversLicense?: boolean;
 willingToTransport?: boolean;
 willingLiveIn?: boolean;
 transitAccessible?: boolean;
 willingClientVehicle?: boolean;
 // Compatibility
 petTolerance?: string;
 smokerHousehold?: boolean;
 technologyComfort?: string;
 employmentType?: string;
 liftExperience?: string[];
 // Compliance
 requireBackground?: boolean;
 requireReference?: boolean;
 medicareCertified?: boolean;
 // Quality
 minTrustScore?: number;
 minProfileCompletion?: number;
 // Pagination
 sortBy: 'score' | 'experience' | 'recent' | 'availability';
 page: number;
 limit: number;
}

export interface CaregiverSearchResult {
 id: string;
 firstName: string;
 lastName: string;
 preferredName?: string;
 jobTitle?: string;
 photoUrl?: string;
 credentials: string[];
 specialties: string[];
 languages: string[];
 yearsExperience: number;
 clientsServedCount: number;
 score: number;
 hasReferences: boolean;
 hasBackgroundCheck: boolean;
 city: string;
 state: string;
 availabilityStatus: string;
 availabilityLabel: string;
 placementTypes: string[];
 willingLiveIn: boolean;
 hasVehicle: boolean;
 openToUrgent: boolean;
 employmentType: string;
 certificationCount: number;
 profileCompletionPct: number;
 hourlyRate?: number;
}

export interface SearchResponse {
 results: CaregiverSearchResult[];
 totalCount: number;
 page: number;
 totalPages: number;
 filters: SearchFilters;
}

export const SPECIALTY_OPTIONS = [
 "Dementia / Alzheimer's",
 "Parkinson's disease",
 "Memory care",
 "Palliative / end of life",
 "Post-hospital recovery",
 "Stroke recovery",
 "Mobility and transfer",
 "Medication management",
 "Complex personal care",
 "Behavioural support",
 "Diabetes management",
 "Mental health support",
 "Paediatric care",
 "Acquired brain injury",
 "Bariatric care",
 "Hospice support",
 "Wound care",
 "Vital signs monitoring",
 "Catheter and ostomy care",
 "Behavioural redirection",
] as const;

export const CREDENTIAL_OPTIONS = [
 "PSW", "RN", "LPN / LVN", "CNA", "HHA", "HCA",
 "CMA", "Nursing Student", "OT Assistant",
 "PT Assistant", "Social Worker", "Hospital Support Worker",
] as const;

export const PLACEMENT_TYPE_OPTIONS = [
 "Permanent placement", "Regular part-time",
 "Casual / relief shifts", "Live-in care",
 "Overnight care", "Respite care",
 "Block booking", "Weekend specialist",
] as const;

export const LANGUAGE_OPTIONS = [
 "English", "French", "Spanish", "Tagalog",
 "Mandarin", "Cantonese", "Hindi", "Punjabi",
 "Arabic", "Portuguese", "Sign Language", "Other",
] as const;

export const DAYS_OF_WEEK = [
 "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
] as const;

export const SHIFT_TYPE_OPTIONS = [
 "Morning (6am–12pm)",
 "Afternoon (12pm–6pm)",
 "Evening (6pm–12am)",
 "Overnight (12am–6am)",
 "24-hour care",
] as const;

export const LIFT_EXPERIENCE_OPTIONS = [
 "Bariatric care",
 "Hoyer / mechanical lift",
 "Two-person assist",
 "Transfer belt",
] as const;

export const EMPLOYMENT_TYPE_OPTIONS = [
 { value: "employee", label: "Agency employee (W2 / T4)" },
 { value: "contractor", label: "Independent contractor (1099)" },
 { value: "either", label: "Open to either" },
] as const;

export const TECHNOLOGY_COMFORT_OPTIONS = [
 { value: "basic", label: "Basic smartphone user" },
 { value: "comfortable", label: "Comfortable with care apps" },
 { value: "experienced", label: "Experienced with digital documentation" },
] as const;

export const PET_TOLERANCE_OPTIONS = [
 { value: "comfortable", label: "Comfortable with pets" },
 { value: "allergies", label: "Has pet allergies" },
 { value: "no_preference", label: "No preference" },
] as const;

export const AVAILABILITY_STATUS_OPTIONS = [
 { value: "available_now", label: "Available now", desc: "Can start within 2 weeks" },
 { value: "open_to_opportunities", label: "Open to opportunities", desc: "Currently placed but open" },
 { value: "available_from", label: "Available from a date", desc: "Finishing current placement" },
 { value: "not_available", label: "Not available", desc: "Profile active, not seeking" },
] as const;

export const US_STATES = [
 { value: "AL", label: "Alabama" }, { value: "AK", label: "Alaska" },
 { value: "AZ", label: "Arizona" }, { value: "AR", label: "Arkansas" },
 { value: "CA", label: "California" }, { value: "CO", label: "Colorado" },
 { value: "CT", label: "Connecticut" }, { value: "DE", label: "Delaware" },
 { value: "FL", label: "Florida" }, { value: "GA", label: "Georgia" },
 { value: "HI", label: "Hawaii" }, { value: "ID", label: "Idaho" },
 { value: "IL", label: "Illinois" }, { value: "IN", label: "Indiana" },
 { value: "IA", label: "Iowa" }, { value: "KS", label: "Kansas" },
 { value: "KY", label: "Kentucky" }, { value: "LA", label: "Louisiana" },
 { value: "ME", label: "Maine" }, { value: "MD", label: "Maryland" },
 { value: "MA", label: "Massachusetts" }, { value: "MI", label: "Michigan" },
 { value: "MN", label: "Minnesota" }, { value: "MS", label: "Mississippi" },
 { value: "MO", label: "Missouri" }, { value: "MT", label: "Montana" },
 { value: "NE", label: "Nebraska" }, { value: "NV", label: "Nevada" },
 { value: "NH", label: "New Hampshire" }, { value: "NJ", label: "New Jersey" },
 { value: "NM", label: "New Mexico" }, { value: "NY", label: "New York" },
 { value: "NC", label: "North Carolina" }, { value: "ND", label: "North Dakota" },
 { value: "OH", label: "Ohio" }, { value: "OK", label: "Oklahoma" },
 { value: "OR", label: "Oregon" }, { value: "PA", label: "Pennsylvania" },
 { value: "RI", label: "Rhode Island" }, { value: "SC", label: "South Carolina" },
 { value: "SD", label: "South Dakota" }, { value: "TN", label: "Tennessee" },
 { value: "TX", label: "Texas" }, { value: "UT", label: "Utah" },
 { value: "VT", label: "Vermont" }, { value: "VA", label: "Virginia" },
 { value: "WA", label: "Washington" }, { value: "WV", label: "West Virginia" },
 { value: "WI", label: "Wisconsin" }, { value: "WY", label: "Wyoming" },
] as const;

export const CANADIAN_PROVINCES = [
 { value: "AB", label: "Alberta" },
 { value: "BC", label: "British Columbia" },
 { value: "MB", label: "Manitoba" },
 { value: "NB", label: "New Brunswick" },
 { value: "NL", label: "Newfoundland and Labrador" },
 { value: "NS", label: "Nova Scotia" },
 { value: "ON", label: "Ontario" },
 { value: "PE", label: "Prince Edward Island" },
 { value: "QC", label: "Quebec" },
 { value: "SK", label: "Saskatchewan" },
] as const;
