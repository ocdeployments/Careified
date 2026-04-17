// Careified — Profile Form Context
// Global state for profile builder — survives step navigation
// Three-layer persistence: Context (instant) + localStorage + DB (on blur)

'use client'

import {
 createContext, useContext, useState,
 useCallback, useEffect, ReactNode
} from 'react'

// ─── Full profile form data type ───────────────────────────────────────────

export interface ProfileFormData {
 // Step 1 — Identity
 firstName?: string
 lastName?: string
 preferredName?: string
 jobTitle?: string
 dateOfBirth?: string
 gender?: string
 phone?: string
 email?: string
 street?: string
 city?: string
 state?: string
 postalCode?: string
 languages?: string[]
 languageFluency?: Record<string, string>
 workAuthorisation?: boolean
 emergencyContact?: {
 name?: string
 phone?: string
 relationship?: string
 }
 bio?: string
 photoUrl?: string

 // Step 2 — Services
 services?: string[]
 specializations?: string[]
 yearsExperience?: number
 skillRatings?: Record<string, string>
 clientTypes?: string[]
 unwillingTasks?: string[]
 dietaryCooking?: string[]

 // Step 3 — Availability
 availabilityStatus?: string
 availableFromDate?: string
 noticePeriod?: string
 weeklyGrid?: Record<string, string[]>
 minHoursPerWeek?: number
 maxHoursPerWeek?: number
 holidayAvailable?: boolean
 earliestStartDate?: string
 placementTypes?: string[]
 preferredAgeGroup?: string
 preferredSettings?: string[]
 hourlyRateMin?: number
 hourlyRateMax?: number
 employmentType?: string

 // Step 4 — Location
 serviceAreas?: string[]
 travelRadius?: number
 hasDriversLicense?: boolean
 hasVehicle?: boolean
 willingToTransport?: boolean
 willingClientVehicle?: boolean
 transitAccessible?: boolean

 // Step 5 — Credentials
 credentials?: string[]
 education?: {
 level?: string
 institution?: string
 field?: string
 year?: string
 enrolled?: boolean
 enrolledProgram?: string
 }
 currentlyEnrolled?: boolean

 // Step 6 — Compliance
 backgroundConsent?: boolean
 backgroundConsentDate?: string
 vulnerableSectorCheck?: string
 drivingRecordCheck?: string
 criminalDeclaration?: boolean
 criminalDeclarationDetail?: string
 bondedInsured?: boolean
 tbClearanceDate?: string
 declarationAccurate?: boolean

 // Step 7 — Personality
 personalityProfile?: Record<string, any>

 // Step 8 — Work history
 workHistory?: Array<{
 id: string
 organisation?: string
 title?: string
 employmentType?: string
 startDate?: string
 endDate?: string
 current?: boolean
 clientTypes?: string[]
 duties?: string[]
 reasonLeaving?: string
 supervisorName?: string
 supervisorContact?: string
 }>
 volunteerExperience?: boolean
 volunteerDescription?: string
 familyCareExperience?: boolean
 familyCareDescription?: string
 professionalMemberships?: string[]

 // Step 9 — References
 references?: Array<{
 id: string
 name?: string
 relationshipType?: string
 organisation?: string
 duration?: string
 contactMethod?: string
 email?: string
 phone?: string
 consentKnows?: boolean
 consentAgreed?: boolean
 consentUnderstands?: boolean
 }>

 // Step 10 — Open questions
 openQ1?: string
 openQ2?: string
 openQ3?: string

 // Meta
 profileCompletionPct?: number
 profilePhase?: number
}

// ─── Context type ──────────────────────────────────────────────────────────

interface ProfileFormContextType {
 formData: ProfileFormData
 updateField: (field: keyof ProfileFormData, value: any) => void
 updateFields: (fields: Partial<ProfileFormData>) => void
 isLoaded: boolean
 saveStatus: 'idle' | 'saving' | 'saved' | 'error'
}

// ─── Context ───────────────────────────────────────────────────────────────

const ProfileFormContext = createContext<ProfileFormContextType>({
 formData: {},
 updateField: () => {},
 updateFields: () => {},
 isLoaded: false,
 saveStatus: 'idle',
})

// ─── Storage key ───────────────────────────────────────────────────────────

const STORAGE_KEY = 'careified_profile_form'

// ─── Provider ──────────────────────────────────────────────────────────────

export function ProfileFormProvider({ children }: { children: ReactNode }) {
 const [formData, setFormData] = useState<ProfileFormData>({})
 const [isLoaded, setIsLoaded] = useState(false)
 const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

 // Load from localStorage on mount
 useEffect(() => {
 try {
 const stored = localStorage.getItem(STORAGE_KEY)
 if (stored) {
 const parsed = JSON.parse(stored)
 setFormData(parsed)
 }
 } catch (e) {
 console.error('Failed to load profile from localStorage:', e)
 }
 setIsLoaded(true)
 }, [])

 // Write to localStorage whenever formData changes (debounced 300ms)
 useEffect(() => {
 if (!isLoaded) return
 const t = setTimeout(() => {
 try {
 localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
 } catch (e) {
 console.error('Failed to save profile to localStorage:', e)
 }
 }, 300)
 return () => clearTimeout(t)
 }, [formData, isLoaded])

 // Update a single field
 const updateField = useCallback((field: keyof ProfileFormData, value: any) => {
 setFormData(prev => ({ ...prev, [field]: value }))
 }, [])

 // Update multiple fields at once
 const updateFields = useCallback((fields: Partial<ProfileFormData>) => {
 setFormData(prev => ({ ...prev, ...fields }))
 }, [])

 return (
 <ProfileFormContext.Provider value={{
 formData,
 updateField,
 updateFields,
 isLoaded,
 saveStatus,
 }}>
 {children}
 </ProfileFormContext.Provider>
 )
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useProfileForm() {
 return useContext(ProfileFormContext)
}
