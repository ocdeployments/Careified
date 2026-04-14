'use server'

import { prisma } from '@/lib/db'

// Mock auth for demo
const mockAuth = () => ({ userId: 'demo-user-id' })

export async function getProfileData() {
 const { userId } = mockAuth()
 if (!userId) return null

 const caregiver = await prisma.caregiver.findUnique({
 where: { userId },
 include: {
 certifications: true,
 references: true,
 }
 })

 return caregiver
}

export async function saveStep2(data: {
 services: string[]
 specializations: string[]
 credentials: string[]
}) {
 const { userId } = mockAuth()
 if (!userId) return { error: 'Unauthorized' }

 const caregiver = await prisma.caregiver.findUnique({
 where: { userId },
 select: { id: true }
 })

 if (!caregiver) return { error: 'Profile not found' }

 await prisma.caregiver.update({
 where: { id: caregiver.id },
 data: {
 services: data.services,
 specializations: data.specializations,
 credentials: data.credentials,
 updatedAt: new Date(),
 }
 })

 return { success: true }
}

export async function saveStep3(data: {
 availabilityStatus: string
 availableFromDate?: string
 noticePeriod?: string
 placementTypes: string[]
 weeklyAvailability: Record<string, { from: string; to: string; flexible: boolean }>
 willingLiveIn: boolean
 willingOvernight: boolean
 hasVehicle: boolean
 travelRadius: number
 city: string
 postalCode: string
 additionalLanguages: string[]
}) {
 const { userId } = mockAuth()
 if (!userId) return { error: 'Unauthorized' }

 const caregiver = await prisma.caregiver.findUnique({
 where: { userId },
 select: { id: true }
 })

 if (!caregiver) return { error: 'Profile not found' }

 await prisma.caregiver.update({
 where: { id: caregiver.id },
 data: {
 availabilityStatus: data.availabilityStatus,
 availableFromDate: data.availableFromDate ? new Date(data.availableFromDate) : null,
 noticePeriod: data.noticePeriod,
 placementTypes: data.placementTypes,
 weeklyAvailability: data.weeklyAvailability,
 willingLiveIn: data.willingLiveIn,
 willingOvernight: data.willingOvernight,
 hasVehicle: data.hasVehicle,
 travelRadius: data.travelRadius,
 city: data.city,
 postalCode: data.postalCode,
 additionalLanguages: data.additionalLanguages,
 updatedAt: new Date(),
 }
 })

 return { success: true }
}

export async function saveStep4(certifications: Array<{
 type: string
 issuingBody: string
 certNumber?: string
 issueDate: string
 expiryDate?: string
 noExpiry: boolean
}>) {
 const { userId } = mockAuth()
 if (!userId) return { error: 'Unauthorized' }

 const caregiver = await prisma.caregiver.findUnique({
 where: { userId },
 select: { id: true }
 })

 if (!caregiver) return { error: 'Profile not found' }

 await prisma.caregiverCertification.deleteMany({
 where: { caregiverId: caregiver.id }
 })

 await prisma.caregiverCertification.createMany({
 data: certifications.map(cert => ({
 caregiverId: caregiver.id,
 type: cert.type,
 issuingBody: cert.issuingBody,
 certNumber: cert.certNumber,
 issueDate: new Date(cert.issueDate),
 expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
 }))
 })

 return { success: true }
}

export async function saveStep5(references: Array<{
 name: string
 relationshipType: string
 organisation?: string
 duration: string
 contactMethod: string
 email?: string
 phone?: string
 consentKnows: boolean
 consentAgreed: boolean
 consentUnderstands: boolean
}>) {
 const { userId } = mockAuth()
 if (!userId) return { error: 'Unauthorized' }

 const caregiver = await prisma.caregiver.findUnique({
 where: { userId },
 select: { id: true }
 })

 if (!caregiver) return { error: 'Profile not found' }

 await prisma.caregiverReference.deleteMany({
 where: { caregiverId: caregiver.id }
 })

 await prisma.caregiverReference.createMany({
 data: references.map(ref => ({
 caregiverId: caregiver.id,
 name: ref.name,
 relationship: ref.relationshipType,
 organisation: ref.organisation,
 duration: ref.duration,
 contactMethod: ref.contactMethod,
 email: ref.email,
 phone: ref.phone,
 }))
 })

 return { success: true }
}

export async function submitProfile() {
 const { userId } = mockAuth()
 if (!userId) return { error: 'Unauthorized' }

 const caregiver = await prisma.caregiver.findUnique({
 where: { userId },
 select: { id: true }
 })

 if (!caregiver) return { error: 'Profile not found' }

 await prisma.caregiver.update({
 where: { id: caregiver.id },
 data: {
 isAvailable: true,
 updatedAt: new Date(),
 }
 })

 await prisma.adminAuditLog.create({
 data: {
 action: 'profile_submitted',
 entityType: 'caregiver',
 entityId: caregiver.id,
 }
 })

 return { success: true }
}
