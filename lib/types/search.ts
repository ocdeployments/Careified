// Search filter types
export interface SearchFilters {
 // Specialties & Skills
 specialties: string[];
 
 // Location
 city?: string;
 state?: string;
 radius?: number;
 
 // Credentials
 credentials: string[];
 
 // Availability
 availabilityStatus?: string;
 placementTypes: string[];
 
 // Trust & Verification
 minTrustScore?: number;
 requireReference?: boolean;
 requireBackground?: boolean;
 
 // Experience
 minExperience?: number;
 maxExperience?: number;
 
 // Sorting & Pagination
 sortBy: 'score' | 'experience' | 'recent';
 page: number;
 limit: number;
}

// Search result item
export interface CaregiverSearchResult {
 id: string;
 firstName: string;
 lastName: string;
 photoUrl?: string;
 credentials: string[];
 yearsExperience: number;
 score: number;
 hasReferences: boolean;
 hasBackgroundCheck: boolean;
 city: string;
 state: string;
 specialties: string[];
 availabilityStatus: string;
 availabilityLabel: string;
 certificationCount: number;
 profileCompleteness: number;
}

// API response
export interface SearchResponse {
 results: CaregiverSearchResult[];
 totalCount: number;
 page: number;
 totalPages: number;
 filters: SearchFilters;
}

// Saved search
export interface SavedSearch {
 id: string;
 name: string;
 filters: SearchFilters;
 resultCount: number;
 lastUsedAt: Date;
 createdAt: Date;
}

// Constants
export const SPECIALTY_OPTIONS = [
 'Dementia / Alzheimer\'s',
 'Parkinson\'s disease',
 'Palliative / end of life',
 'Post-hospital recovery',
 'Stroke recovery',
 'Diabetes management',
 'Mobility and transfer',
 'Medication management',
 'Complex personal care',
 'Behavioural support',
 'Mental health support',
 'Paediatric care',
 'Acquired brain injury',
 'Bariatric care',
 'Hospice support',
];

export const CREDENTIAL_OPTIONS = [
 'PSW',
 'RN',
 'LPN / LVN',
 'CNA',
 'HHA',
 'Nursing Student',
 'OT Assistant',
 'PT Assistant',
 'Social Worker',
 'Hospital Support Worker',
];

export const PLACEMENT_TYPE_OPTIONS = [
 'Permanent placement',
 'Regular part-time',
 'Casual / relief shifts',
 'Live-in care',
 'Overnight care',
 'Respite care',
 'Block booking',
 'Weekend specialist',
];

export const US_STATES = [
 { code: 'TX', name: 'Texas' },
 { code: 'CA', name: 'California' },
 { code: 'NY', name: 'New York' },
 { code: 'FL', name: 'Florida' },
 { code: 'IL', name: 'Illinois' },
 { code: 'PA', name: 'Pennsylvania' },
 { code: 'OH', name: 'Ohio' },
 { code: 'GA', name: 'Georgia' },
 { code: 'NC', name: 'North Carolina' },
 { code: 'MI', name: 'Michigan' },
 { code: 'WA', name: 'Washington' },
 { code: 'AZ', name: 'Arizona' },
 { code: 'MA', name: 'Massachusetts' },
 { code: 'TN', name: 'Tennessee' },
 { code: 'IN', name: 'Indiana' },
 { code: 'MO', name: 'Missouri' },
 { code: 'MD', name: 'Maryland' },
 { code: 'WI', name: 'Wisconsin' },
 { code: 'CO', name: 'Colorado' },
 { code: 'MN', name: 'Minnesota' },
];
