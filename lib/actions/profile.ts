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
        firstName: '',
        lastName: '',
        phone: '',
        city: '',
        state: '',
        postalCode: '',
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
    const certifications = await prisma.caregiverCertification.findMany({ where: { caregiverId: caregiver.id } })
    const references = await prisma.caregiverReference.findMany({ where: { caregiverId: caregiver.id } })
    
    return { user, caregiver, certifications, references }
  } catch (error) {
    console.error('Error getting profile data:', error)
    return null
  }
}

export async function saveStep1(data: {
  firstName: string
  lastName: string
  preferredName?: string
  phone: string
  email: string
}) {
  try {
    const caregiver = await getOrCreateCaregiver()
    
    await prisma.caregiver.update({
      where: { id: caregiver.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        preferredName: data.preferredName,
        phone: data.phone,
        updatedAt: new Date(),
      }
    })
    
    await prisma.user.update({
      where: { id: caregiver.userId },
      data: { email: data.email }
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error saving step 1:', error)
    return { error: 'Failed to save' }
  }
}

export async function saveStep2(data: {
  services: string[]
  credentials: string[]
}) {
  try {
    const caregiver = await getOrCreateCaregiver()
    
    await prisma.caregiver.update({
      where: { id: caregiver.id },
      data: {
        services: data.services,
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
  availabilityStatus?: string
  city?: string
  state?: string
  postalCode?: string
  address?: string
  placementTypes?: string[]
  weeklyAvailability?: Record<string, any>
  willingLiveIn?: boolean
  willingOvernight?: boolean
  hasVehicle?: boolean
  travelRadius?: number
  serviceCity?: string
  serviceState?: string
  serviceZIP?: string
  additionalLanguages?: string[]
  specializations?: string[]
}) {
  try {
    const caregiver = await getOrCreateCaregiver()
    
    await prisma.caregiver.update({
      where: { id: caregiver.id },
      data: {
        availabilityStatus: data.availabilityStatus || 'available_now',
        city: data.city || data.serviceCity,
        state: data.state || data.serviceState,
        postalCode: data.postalCode || data.serviceZIP,
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
          certification: cert.type,
          issuingOrg: cert.issuingBody,
          certNumber: cert.certNumber,
          issueDate: new Date(cert.issueDate),
          expiryDate: cert.noExpiry ? null : (cert.expiryDate ? new Date(cert.expiryDate) : null),
          status: cert.noExpiry ? 'active' : (cert.expiryDate && new Date(cert.expiryDate) > new Date() ? 'active' : 'expired'),
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
  contactMethod?: string
  email?: string
  phone?: string
  consentGiven?: boolean
  consentDate?: string
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
        status: 'pending',
        updatedAt: new Date(),
      }
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error submitting profile:', error)
    return { error: 'Failed to submit' }
  }
}
