'use server'

import { prisma } from '@/lib/db'

// Mock auth for demo - creates user/caregiver if not exists
async function getOrCreateCaregiver() {
  const mockUserId = 'demo-user-id'
  
  // Find or create user
  let user = await prisma.user.findUnique({
    where: { id: mockUserId }
  })
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: mockUserId,
        email: 'demo@careified.com',
        firstName: 'Demo',
        lastName: 'User',
        role: 'CAREGIVER',
      }
    })
  }
  
  // Find or create caregiver
  let caregiver = await prisma.caregiver.findUnique({
    where: { userId: mockUserId }
  })
  
  if (!caregiver) {
    caregiver = await prisma.caregiver.create({
      data: {
        userId: mockUserId,
        firstName: 'Demo',
        lastName: 'User',
        isAvailable: false,
      }
    })
  }
  
  return caregiver
}

export async function getProfileData() {
  try {
    const caregiver = await getOrCreateCaregiver()
    
    const fullCaregiver = await prisma.caregiver.findUnique({
      where: { id: caregiver.id },
      include: {
        certifications: true,
        references: true,
      }
    })
    
    return fullCaregiver
  } catch (error) {
    console.error('Error getting profile:', error)
    return null
  }
}

export async function saveStep2(data: {
  services: string[]
  specializations: string[]
  credentials: string[]
}) {
  try {
    const caregiver = await getOrCreateCaregiver()
    
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
  } catch (error) {
    console.error('Error saving step 2:', error)
    return { error: 'Failed to save' }
  }
}

export async function saveStep3(data: {
  availabilityStatus: string
  availableFromDate?: string
  noticePeriod?: string
  placementTypes: string[]
  weeklyAvailability: Record<string, any>
  willingLiveIn: boolean
  willingOvernight: boolean
  hasVehicle: boolean
  travelRadius: number
  city: string
  postalCode: string
  additionalLanguages: string[]
}) {
  try {
    const caregiver = await getOrCreateCaregiver()
    
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
  } catch (error) {
    console.error('Error saving step 3:', error)
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
          type: cert.type,
          issuingBody: cert.issuingBody,
          certNumber: cert.certNumber,
          issueDate: new Date(cert.issueDate),
          expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
        }))
      })
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error saving step 4:', error)
    return { error: 'Failed to save' }
  }
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
          contactMethod: ref.contactMethod,
          email: ref.email,
          phone: ref.phone,
        }))
      })
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error saving step 5:', error)
    return { error: 'Failed to save' }
  }
}

export async function submitProfile() {
  try {
    const caregiver = await getOrCreateCaregiver()
    
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
  } catch (error) {
    console.error('Error submitting profile:', error)
    return { error: 'Failed to submit' }
  }
}
