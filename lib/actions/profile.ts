'use server'

import { prisma } from '@/lib/db'

async function getOrCreateCaregiver() {
 const mockUserId = 'demo-user-id'

 let user = await prisma.user.findUnique({ where: { id: mockUserId } })
 if (!user) {
 user = await prisma.user.create({
 data: {
 id: mockUserId,
 email: 'demo@careified.com',
 role: 'CAREGIVER'
 }
 })
 }

 let caregiver = await prisma.caregiver.findFirst({ where: { userId: mockUserId } })
 if (!caregiver) {
 caregiver = await prisma.caregiver.create({
 data: {
 userId: mockUserId,
 first_name: '',
 last_name: '',
 phone: '',
 city: '',
 state: '',
 postal_code: '',
 gender: '',
 status: 'incomplete'
 }
 })
 }

 return caregiver
}

export async function getProfileData() {
 try {
 const caregiver = await getOrCreateCaregiver()
 const user = await prisma.user.findUnique({ where: { id: caregiver.userId } })
 const certifications = await prisma.caregiverCertification.findMany({
 where: { caregiverId: caregiver.id }
 })
 const references = await prisma.caregiverReference.findMany({
 where: { caregiverId: caregiver.id }
 })
 return { user, caregiver, certifications, references }
 } catch (error) {
 console.error('getProfileData error:', error)
 return null
 }
}

export async function saveStep1(data: {
 firstName: string
 lastName: string
 preferredName?: string
 phone: string
 email: string
 gender?: string
 city?: string
 state?: string
 postalCode?: string
 languages?: string[]
}) {
 try {
 const caregiver = await getOrCreateCaregiver()

 await prisma.caregiver.update({
 where: { id: caregiver.id },
 data: {
 first_name: data.firstName,
 last_name: data.lastName,
 preferred_name: data.preferredName,
 phone: data.phone,
 gender: data.gender,
 city: data.city ,
 state: data.state,
 postal_code: data.postalCode,
 languages: data.languages || [],
 }
 })

 await prisma.user.update({
 where: { id: caregiver.userId },
 data: { email: data.email }
 })

 return { success: true }
 } catch (error) {
 console.error('saveStep1 error:', error)
 return { error: 'Failed to save' }
 }
}

export async function saveStep2(data: {
 services: string[]
 credentials: string[]
 specializations?: string[]
}) {
 try {
 const caregiver = await getOrCreateCaregiver()

 await prisma.caregiver.update({
 where: { id: caregiver.id },
 data: {
 services: data.services,
 credentials: data.credentials,
 specializations: data.specializations || [],
 }
 })

 return { success: true }
 } catch (error) {
 console.error('saveStep2 error:', error)
 return { error: 'Failed to save' }
 }
}

export async function saveStep3(data: {
 availabilityStatus?: string
 city?: string
 state?: string
 postalCode?: string
 placementTypes?: string[]
 daysAvailable?: string[]
 shiftTimes?: Record<string, any>
  serviceCity?: string
 serviceState?: string
 serviceZIP?: string
 additionalLanguages?: string[]
 specializations?: string[]
 willingLiveIn?: boolean
 willingOvernight?: boolean
 openToUrgent?: boolean
 hasVehicle?: boolean
 hasDriversLicense?: boolean
 willingToTransport?: boolean
 willingClientVehicle?: boolean
 transitAccessible?: boolean
 travelRadius?: number
 minHoursPerWeek?: number
 maxHoursPerWeek?: number
 holidayAvailable?: boolean
 petTolerance?: string
 smokerHousehold?: boolean
 technologyComfort?: string
 employmentType?: string
 liftExperience?: string[]
}) {
 try {
 const caregiver = await getOrCreateCaregiver()

 await prisma.caregiver.update({
 where: { id: caregiver.id },
 data: {
 availability_status: data.availabilityStatus || 'available_now',
 city: data.city || data.serviceCity,
 state: data.state || data.serviceState,
 postal_code: data.postalCode || data.serviceZIP,
 placement_types: data.placementTypes || [],
 days_available: data.daysAvailable || [],
 shift_times: data.shiftTimes || {},
 willing_live_in: data.willingLiveIn ?? false,
 willing_overnight: data.willingOvernight ?? false,
 open_to_urgent: data.openToUrgent ?? false,
 has_vehicle: data.hasVehicle ?? false,
 has_drivers_license: data.hasDriversLicense ?? false,
 willing_to_transport: data.willingToTransport ?? false,
 willing_client_vehicle: data.willingClientVehicle ?? false,
 transit_accessible: data.transitAccessible ?? false,
 travel_radius: data.travelRadius,
 min_hours_per_week: data.minHoursPerWeek,
 max_hours_per_week: data.maxHoursPerWeek,
 holiday_available: data.holidayAvailable ?? false,
 pet_tolerance: data.petTolerance || 'no_preference',
 smoker_household: data.smokerHousehold ?? false,
 technology_comfort: data.technologyComfort || 'basic',
 employment_type: data.employmentType || 'either',
 languages: data.additionalLanguages || [],
 lift_experience: data.liftExperience || [],
 }
 })

 return { success: true }
 } catch (error) {
 console.error('saveStep3 error:', error)
 return { error: 'Failed to save' }
 }
}

export async function saveStep4(certifications: Array<{
 type: string
 issuingBody: string
 certNumber?: string
 issueDate: string
 expiryDate?: string
 noExpiry: boolean
}>) {
 try {
 const caregiver = await getOrCreateCaregiver()

 await prisma.caregiverCertification.deleteMany({
 where: { caregiverId: caregiver.id }
 })

 if (certifications.length > 0) {
 await prisma.caregiverCertification.createMany({
 data: certifications.map(cert => ({
 caregiverId: caregiver.id,
 certification: cert.type,
 issuing_org: cert.issuingBody,
 cert_number: cert.certNumber,
 issue_date: new Date(cert.issueDate),
 expiry_date: cert.noExpiry
 ? null
 : cert.expiryDate ? new Date(cert.expiryDate) : null,
 status: cert.noExpiry
 ? 'active'
 : cert.expiryDate && new Date(cert.expiryDate) > new Date()
 ? 'active'
 : 'expired',
 }))
 })
 }

 return { success: true }
 } catch (error) {
 console.error('saveStep4 error:', error)
 return { error: 'Failed to save' }
 }
}

export async function saveStep5(references: Array<{
 name: string
 relationshipType: string
 organisation?: string
 duration: string
 contactMethod?: string
 email?: string
 phone?: string
 consentGiven?: boolean
}>) {
 try {
 const caregiver = await getOrCreateCaregiver()

 await prisma.caregiverReference.deleteMany({
 where: { caregiverId: caregiver.id }
 })

 if (references.length > 0) {
 await prisma.caregiverReference.createMany({
 data: references.map(ref => ({
 caregiverId: caregiver.id,
 name: ref.name,
 relationship: ref.relationshipType,
 organisation: ref.organisation,
 duration: ref.duration,
 contact_method: ref.contactMethod,
 email: ref.email,
 phone: ref.phone,
 }))
 })
 }

 return { success: true }
 } catch (error) {
 console.error('saveStep5 error:', error)
 return { error: 'Failed to save' }
 }
}

export async function submitProfile() {
 try {
 const caregiver = await getOrCreateCaregiver()

 await prisma.caregiver.update({
 where: { id: caregiver.id },
 data: { status: 'pending' }
 })

 return { success: true }
 } catch (error) {
 console.error('submitProfile error:', error)
 return { error: 'Failed to submit' }
 }
}
