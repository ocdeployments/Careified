export interface ShortlistEntry {
  id: string
  agencyId: string
  caregiverId: string
  notes: string | null
  createdAt: Date
}

export interface ShortlistResponse {
  success: boolean
  message: string
  entry?: ShortlistEntry
}