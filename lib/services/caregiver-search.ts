// Careified — CaregiverSearchService — Session 5
// All columns use actual Render DB snake_case names
// No joins to caregiver_security (table does not exist)

import { Pool } from 'pg';
import { SearchFilters, CaregiverSearchResult, SearchResponse } from '@/lib/types/search';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export class CaregiverSearchService {

 static async search(filters: SearchFilters): Promise<SearchResponse> {
 const conditions: string[] = [];
 const params: any[] = [];
 let p = 1;

 conditions.push(`c.status = 'approved'`);

 // Location
 if (filters.city) {
 conditions.push(`LOWER(c.city) LIKE $${p++}`);
 params.push(`%${filters.city.toLowerCase()}%`);
 }
 if (filters.state) {
 conditions.push(`c.state = $${p++}`);
 params.push(filters.state);
 }

 // Availability
 if (filters.availabilityStatus) {
 conditions.push(`c.availability_status = $${p++}`);
 params.push(filters.availabilityStatus);
 }
 if (filters.placementTypes?.length > 0) {
 const ph = filters.placementTypes.map(() => `$${p++}`).join(', ');
 conditions.push(`c.placement_types && ARRAY[${ph}]`);
 params.push(...filters.placementTypes);
 }
 if (filters.daysAvailable?.length > 0) {
 const ph = filters.daysAvailable.map(() => `$${p++}`).join(', ');
 conditions.push(`c.days_available && ARRAY[${ph}]`);
 params.push(...filters.daysAvailable);
 }
 if (filters.minHoursPerWeek) {
 conditions.push(`c.min_hours_per_week >= $${p++}`);
 params.push(filters.minHoursPerWeek);
 }
 if (filters.holidayAvailable === true) {
 conditions.push(`c.holiday_available = true`);
 }
 if (filters.openToUrgent === true) {
 conditions.push(`c.open_to_urgent = true`);
 }

 // Skills
 if (filters.specialties?.length > 0) {
 const ph = filters.specialties.map(() => `$${p++}`).join(', ');
 conditions.push(`c.specializations && ARRAY[${ph}]`);
 params.push(...filters.specialties);
 }
 if (filters.credentials?.length > 0) {
 const ph = filters.credentials.map(() => `$${p++}`).join(', ');
 conditions.push(`c.credentials && ARRAY[${ph}]`);
 params.push(...filters.credentials);
 }
 if (filters.languages?.length > 0) {
 const ph = filters.languages.map(() => `$${p++}`).join(', ');
 conditions.push(`c.languages && ARRAY[${ph}]`);
 params.push(...filters.languages);
 }
 if (filters.minExperience) {
 conditions.push(`c.years_experience >= $${p++}`);
 params.push(filters.minExperience);
 }
 if (filters.maxExperience) {
 conditions.push(`c.years_experience <= $${p++}`);
 params.push(filters.maxExperience);
 }

 // Logistics
 if (filters.hasVehicle === true) conditions.push(`c.has_vehicle = true`);
 if (filters.hasDriversLicense === true) conditions.push(`c.has_drivers_license = true`);
 if (filters.willingToTransport === true) conditions.push(`c.willing_to_transport = true`);
 if (filters.willingLiveIn === true) conditions.push(`c.willing_live_in = true`);
 if (filters.transitAccessible === true) conditions.push(`c.transit_accessible = true`);
 if (filters.willingClientVehicle === true) conditions.push(`c.willing_client_vehicle = true`);

 // Compatibility
 if (filters.petTolerance && filters.petTolerance !== 'no_preference') {
 conditions.push(`c.pet_tolerance = $${p++}`);
 params.push(filters.petTolerance);
 }
 if (filters.smokerHousehold === true) conditions.push(`c.smoker_household = true`);
 if (filters.employmentType && filters.employmentType !== 'either') {
 conditions.push(`(c.employment_type = $${p++} OR c.employment_type = 'either')`);
 params.push(filters.employmentType);
 }
 if (filters.liftExperience?.length > 0) {
 const ph = filters.liftExperience.map(() => `$${p++}`).join(', ');
 conditions.push(`c.lift_experience && ARRAY[${ph}]`);
 params.push(...filters.liftExperience);
 }
 if (filters.technologyComfort) {
 conditions.push(`(
 CASE c.technology_comfort
 WHEN 'basic' THEN 1
 WHEN 'comfortable' THEN 2
 WHEN 'experienced' THEN 3
 ELSE 0
 END
 ) >= (
 CASE $${p++}::text
 WHEN 'basic' THEN 1
 WHEN 'comfortable' THEN 2
 WHEN 'experienced' THEN 3
 ELSE 0
 END
 )`);
 params.push(filters.technologyComfort);
 }

 // Compliance
 if (filters.requireReference === true) {
 conditions.push(`EXISTS (
 SELECT 1 FROM caregiver_references cr WHERE cr.caregiver_id = c.id
 )`);
 }
 if (filters.requireBackground === true) {
 conditions.push(`EXISTS (
 SELECT 1 FROM caregiver_certifications cc
 WHERE cc.caregiver_id = c.id AND cc.status = 'verified'
 )`);
 }
 if (filters.medicareCertified === true) conditions.push(`c.medicare_certified = true`);

 // Quality
 if (filters.minTrustScore && filters.minTrustScore > 0) {
 conditions.push(`c.aggregate_score >= $${p++}`);
 params.push(filters.minTrustScore);
 }
 if (filters.minProfileCompletion && filters.minProfileCompletion > 0) {
 conditions.push(`c.profile_completion_pct >= $${p++}`);
 params.push(filters.minProfileCompletion);
 }

 const whereClause = `WHERE ${conditions.join(' AND ')}`;

 let orderBy: string;
 switch (filters.sortBy) {
 case 'experience':
 orderBy = 'ORDER BY c.years_experience DESC NULLS LAST'; break;
 case 'recent':
 orderBy = 'ORDER BY c.id DESC'; break;
 case 'availability':
 orderBy = `ORDER BY CASE c.availability_status
 WHEN 'available_now' THEN 1
 WHEN 'open_to_opportunities' THEN 2
 WHEN 'available_from' THEN 3
 ELSE 4 END ASC`; break;
 default:
 orderBy = 'ORDER BY c.aggregate_score DESC NULLS LAST';
 }

 const limit = Math.min(filters.limit || 20, 50);
 const offset = ((filters.page || 1) - 1) * limit;

 const countResult = await pool.query(
 `SELECT COUNT(*) as total FROM caregivers c ${whereClause}`,
 params
 );
 const totalCount = parseInt(countResult.rows[0].total, 10);

 const dataParams = [...params, limit, offset];
 const dataResult = await pool.query(`
 SELECT
 c.id,
 c.first_name,
 c.last_name,
 c.preferred_name,
 c.job_title,
 c.photo_url,
 c.credentials,
 c.specializations,
 c.languages,
 c.years_experience,
 c.clients_served_count,
 c.aggregate_score,
 c.city,
 c.state,
 c.availability_status,
 c.placement_types,
 c.willing_live_in,
 c.has_vehicle,
 c.open_to_urgent,
 c.employment_type,
 c.hourly_rate,
 c.profile_completion_pct,
 (SELECT COUNT(*) FROM caregiver_certifications cc WHERE cc.caregiver_id = c.id) AS cert_count,
 (SELECT COUNT(*) FROM caregiver_references cr WHERE cr.caregiver_id = c.id) AS ref_count
 FROM caregivers c
 ${whereClause}
 ${orderBy}
 LIMIT $${p++} OFFSET $${p++}
 `, dataParams);

 const results: CaregiverSearchResult[] = dataResult.rows.map(row => ({
 id: row.id,
 firstName: row.first_name || '',
 lastName: row.last_name || '',
 preferredName: row.preferred_name || undefined,
 jobTitle: row.job_title || undefined,
 photoUrl: row.photo_url || undefined,
 credentials: row.credentials || [],
 specialties: (row.specializations || []).slice(0, 3),
 languages: row.languages || [],
 yearsExperience: row.years_experience || 0,
 clientsServedCount: row.clients_served_count || 0,
 score: row.aggregate_score ? parseFloat(row.aggregate_score) : 0,
 hasReferences: parseInt(row.ref_count, 10) > 0,
 hasBackgroundCheck: parseInt(row.cert_count, 10) > 0,
 city: row.city || '',
 state: row.state || '',
 availabilityStatus: row.availability_status || 'not_available',
 availabilityLabel: this.getAvailabilityLabel(row.availability_status),
 placementTypes: row.placement_types || [],
 willingLiveIn: row.willing_live_in || false,
 hasVehicle: row.has_vehicle || false,
 openToUrgent: row.open_to_urgent || false,
 employmentType: row.employment_type || 'either',
 certificationCount: parseInt(row.cert_count, 10) || 0,
 profileCompletionPct: row.profile_completion_pct ? parseFloat(row.profile_completion_pct) : 0,
 hourlyRate: row.hourly_rate ? parseFloat(row.hourly_rate) : undefined,
 }));

 return {
 results,
 totalCount,
 page: filters.page || 1,
 totalPages: Math.ceil(totalCount / limit),
 filters,
 };
 }

 private static getAvailabilityLabel(status?: string): string {
 const map: Record<string, string> = {
 available_now: 'Available now',
 open_to_opportunities: 'Open to opportunities',
 available_from: 'Available from date',
 not_available: 'Not available',
 };
 return map[status || ''] || 'Unknown';
 }
}
