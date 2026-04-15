// Careified — Profile Completion Calculator
// Updated: Session 6D
// Max achievable now: 85% (personality Step 7 = 15% reserved)
// Tiers: Basic 40% / Verified 60% / Professional 80% / Elite 95%

export interface CompletionInput {
 // Identity
 firstName?: string | null
 lastName?: string | null
 photoUrl?: string | null
 city?: string | null
 gender?: string | null
 // Services
 services?: string[]
 credentials?: string[]
 // Availability
 availabilityStatus?: string | null
 placementTypes?: string[]
 // Certifications (count from related table)
 certificationCount?: number
 // References (count from related table)
 referenceCount?: number
 // Languages
 languages?: string[]
 // Logistics
 hasVehicle?: boolean | null
 willingToTransport?: boolean | null
 travelRadius?: number | null
 // Compatibility
 petTolerance?: string | null
 smokerHousehold?: boolean | null
 employmentType?: string | null
 // Soft skills strengths (from personality_profile jsonb)
 strengthsCount?: number
 // Personality Step 7 — reserved, not yet built
 // personalityComplete?: boolean
}

export interface CompletionResult {
 score: number
 tier: 'incomplete' | 'basic' | 'verified' | 'professional' | 'elite'
 tierLabel: string
 breakdown: Record<string, number>
}

export function calculateProfileCompletion(input: CompletionInput): CompletionResult {
 const breakdown: Record<string, number> = {}

 // --- Identity 15% ---
 let identity = 0
 if (input.firstName && input.lastName) identity += 6
 if (input.city) identity += 4
 if (input.gender) identity += 3
 if (input.photoUrl) identity += 2
 breakdown.identity = Math.min(identity, 15)

 // --- Services + Credentials 15% ---
 let services = 0
 if ((input.services?.length || 0) >= 3) services += 8
 else if ((input.services?.length || 0) >= 1) services += 4
 if ((input.credentials?.length || 0) >= 1) services += 7
 breakdown.services = Math.min(services, 15)

 // --- Availability 15% ---
 let availability = 0
 if (input.availabilityStatus) availability += 8
 if ((input.placementTypes?.length || 0) >= 1) availability += 7
 breakdown.availability = Math.min(availability, 15)

 // --- Certifications 10% ---
 let certs = 0
 if ((input.certificationCount || 0) >= 1) certs += 10
 breakdown.certifications = Math.min(certs, 10)

 // --- References 10% ---
 let refs = 0
 if ((input.referenceCount || 0) >= 1) refs += 10
 breakdown.references = Math.min(refs, 10)

 // --- Languages 5% ---
 let langs = 0
 if ((input.languages?.length || 0) >= 1) langs += 5
 breakdown.languages = Math.min(langs, 5)

 // --- Logistics 5% ---
 let logistics = 0
 if (input.hasVehicle !== null && input.hasVehicle !== undefined) logistics += 2
 if (input.willingToTransport !== null && input.willingToTransport !== undefined) logistics += 1
 if (input.travelRadius) logistics += 2
 breakdown.logistics = Math.min(logistics, 5)

 // --- Compatibility 5% ---
 let compat = 0
 if (input.petTolerance) compat += 2
 if (input.smokerHousehold !== null && input.smokerHousehold !== undefined) compat += 1
 if (input.employmentType) compat += 2
 breakdown.compatibility = Math.min(compat, 5)

 // --- Soft skills strengths 5% ---
 let strengths = 0
 if ((input.strengthsCount || 0) >= 5) strengths += 5
 else if ((input.strengthsCount || 0) >= 1) strengths += 2
 breakdown.strengths = Math.min(strengths, 5)

 // --- Personality Step 7 — 15% reserved ---
 breakdown.personality = 0 // not yet built

 // --- Total ---
 const score = Object.values(breakdown).reduce((a, b) => a + b, 0)

 const tier =
 score >= 95 ? 'elite' :
 score >= 80 ? 'professional' :
 score >= 60 ? 'verified' :
 score >= 40 ? 'basic' :
 'incomplete'

 const tierLabel =
 tier === 'elite' ? 'Elite' :
 tier === 'professional' ? 'Professional' :
 tier === 'verified' ? 'Verified' :
 tier === 'basic' ? 'Basic' :
 'Incomplete'

 return { score, tier, tierLabel, breakdown }
}

export function getTierColor(tier: string): string {
 switch (tier) {
 case 'elite': return '#C9973A'
 case 'professional': return '#1E3A8A'
 case 'verified': return '#16A34A'
 case 'basic': return '#64748B'
 default: return '#94A3B8'
 }
}
