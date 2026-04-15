import { Pool } from 'pg';
import { SearchFilters, CaregiverSearchResult, SearchResponse } from '@/lib/types/search';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://careified_user:nFvV7KEqXSX9unj8X7BPdGlIZokqWqi6@187.124.227.63:5432/careified'
});

export class CaregiverSearchService {
 
 static async search(filters: SearchFilters): Promise<SearchResponse> {
 
 const conditions: string[] = [];
 const params: any[] = [];
 let paramIndex = 1;
 
 conditions.push(`c.status = 'approved'`);
 
 if (filters.city) {
  conditions.push(`LOWER(c.city) LIKE $${paramIndex}`);
  params.push(`%${filters.city.toLowerCase()}%`);
  paramIndex++;
 }
 
 if (filters.state) {
  conditions.push(`c.state = $${paramIndex}`);
  params.push(filters.state);
  paramIndex++;
 }
 
 if (filters.specialties && filters.specialties.length > 0) {
  const placeholders = filters.specialties.map((_, i) => `$${paramIndex + i}`).join(', ');
  conditions.push(`c.specialties && ARRAY[${placeholders}]`);
  params.push(...filters.specialties);
  paramIndex += filters.specialties.length;
 }
 
 if (filters.credentials && filters.credentials.length > 0) {
  const placeholders = filters.credentials.map((_, i) => `$${paramIndex + i}`).join(', ');
  conditions.push(`c.credentials && ARRAY[${placeholders}]`);
  params.push(...filters.credentials);
  paramIndex += filters.credentials.length;
 }
 
 if (filters.availabilityStatus) {
  conditions.push(`c.availability_status = $${paramIndex}`);
  params.push(filters.availabilityStatus);
  paramIndex++;
 }
 
 if (filters.minTrustScore && filters.minTrustScore > 0) {
  conditions.push(`c.score >= $${paramIndex}`);
  params.push(filters.minTrustScore);
  paramIndex++;
 }
 
 if (filters.minExperience) {
  conditions.push(`c."yearsExperience" >= $${paramIndex}`);
  params.push(filters.minExperience);
  paramIndex++;
 }
 
 if (filters.maxExperience) {
  conditions.push(`c."yearsExperience" <= $${paramIndex}`);
  params.push(filters.maxExperience);
  paramIndex++;
 }
 
 const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
 
 let orderBy = 'ORDER BY c.score DESC';
 switch (filters.sortBy) {
  case 'experience':
   orderBy = 'ORDER BY c."yearsExperience" DESC';
   break;
  case 'recent':
   orderBy = 'ORDER BY c."createdAt" DESC';
   break;
  case 'score':
  default:
   orderBy = 'ORDER BY c.score DESC';
 }
 
 const limit = filters.limit || 20;
 const offset = ((filters.page || 1) - 1) * limit;
 
 const countQuery = `
  SELECT COUNT(*) as total
  FROM caregivers c
  ${whereClause}
 `;
 
 const countResult = await pool.query(countQuery, params);
 const totalCount = parseInt(countResult.rows[0].total);
 
 const query = `
  SELECT 
   c.id,
   c."firstName",
   c."lastName",
   c."profilePhotoUrl",
   c.credentials,
   c."yearsExperience",
   c.score,
   c.city,
   c.state,
   c.specialties,
   c.availability_status,
   c.profile_completeness,
   (SELECT COUNT(*) FROM caregiver_certifications cc WHERE cc."caregiverId" = c.id) as cert_count,
   (SELECT COUNT(*) FROM caregiver_references cr WHERE cr."caregiverId" = c.id) as ref_count,
   cs."backgroundCheck"
  FROM caregivers c
  LEFT JOIN caregiver_security cs ON cs."caregiverId" = c.id
  ${whereClause}
  ${orderBy}
  LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
 `;
 
 params.push(limit, offset);
 
 const result = await pool.query(query, params);
 
 const results: CaregiverSearchResult[] = result.rows.map(c => ({
  id: c.id,
  firstName: c.firstName || '',
  lastName: c.lastName || '',
  photoUrl: c.profilePhotoUrl || undefined,
  credentials: c.credentials || [],
  yearsExperience: c.yearsExperience || 0,
  score: c.score ? parseFloat(c.score) : 0,
  hasReferences: (c.ref_count || 0) > 0,
  hasBackgroundCheck: !!c.backgroundCheck,
  city: c.city || '',
  state: c.state || '',
  specialties: (c.specialties || []).slice(0, 3),
  availabilityStatus: c.availability_status || 'not_available',
  availabilityLabel: this.getAvailabilityLabel(c.availability_status),
  certificationCount: c.cert_count || 0,
  profileCompleteness: c.profile_completeness || 0,
 }));
 
 const totalPages = Math.ceil(totalCount / limit);
 
 return {
  results,
  totalCount,
  page: filters.page || 1,
  totalPages,
  filters,
 };
 }
 
 private static getAvailabilityLabel(status?: string): string {
  switch (status) {
   case 'available_now':
    return 'Available now';
   case 'open_to_opportunities':
    return 'Open to opportunities';
   case 'available_from':
    return 'Available from date';
   default:
    return 'Not available';
  }
 }
}
