# Careified Database Schema

## Overview
This document describes the database schema for the Careified healthcare hiring platform.

## Tables

### Users Table (`users`)
Base table for all user types.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| email | String | Unique email |
| passwordHash | String | Hashed password |
| role | Enum | CAREGIVER, AGENCY, FAMILY, ADMIN |
| isActive | Boolean | Account status |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### Caregivers Table (`caregivers`)
Healthcare caregiver profiles.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| userId | String | Foreign key to users |
| firstName | String | First name |
| lastName | String | Last name |
| phone | String | Phone number |
| city | String | City |
| state | String | State |
| postalCode | String | ZIP code |
| gender | String | Gender |
| pronouns | String? | Preferred pronouns |
| bio | String? | Biography |
| yearsExperience | Int | Years of experience |
| hourlyRate | Float? | Hourly rate |
| isAvailable | Boolean | Availability status |
| aggregateScore | Decimal(3,2) | Average rating (1.00-5.00) |
| ratingCount | Int | Number of ratings |
| profilePhotoUrl | String? | Photo URL |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### Agencies Table (`agencies`)
Healthcare agency accounts.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| userId | String | Foreign key to users |
| name | String | Agency name |
| description | String? | Description |
| phone | String? | Phone number |
| website | String? | Website URL |
| logoUrl | String? | Logo URL |
| address | String? | Street address |
| city | String? | City |
| state | String? | State |
| postalCode | String? | ZIP code |
| isVerified | Boolean | Verification status |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### Families Table (`families`)
Family accounts seeking care.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| userId | String | Foreign key to users |
| firstName | String | First name |
| lastName | String | Last name |
| phone | String? | Phone number |
| address | String? | Street address |
| city | String? | City |
| state | String? | State |
| postalCode | String? | ZIP code |
| careNeeds | String? | Care requirements |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### Caregiver Certifications Table (`caregiver_certifications`)
Professional certifications for caregivers.

### Caregiver References Table (`caregiver_references`)
Professional references for caregivers.

### Caregiver Security Table (`caregiver_security`)
Background check and security info.

### Caregiver Documents Table (`caregiver_documents`)
Uploaded documents for caregivers.

### Caregiver Ratings Table (`caregiver_ratings`)
Public ratings for caregivers.

### Admin Audit Log Table (`admin_audit_log`)
Audit trail for admin actions.

## Agency-Caregiver Relationship Tables (Added Week 2)

### agency_caregiver_relationships
Tracks employment relationship between agency and caregiver.
All data is PRIVATE to the agency - caregivers cannot see it.

Columns:
- id: Unique identifier
- agencyId: Which agency owns this record
- caregiverId: Which caregiver this is about
- startDate: When employment started
- endDate: When employment ended (null if current)
- employmentType: permanent | contract | casual
- currentlyEmployed: Boolean flag
- privateNotes: Free-text notes (agency eyes only)
- payRate: What agency pays (private)
- payRateType: hourly | salary
- internalRating: Agency's private 1-5 rating
- totalShifts: Auto-incremented shift counter
- noShowCount: Auto-incremented no-show counter
- lastShiftDate: Auto-updated from shifts

### caregiver_shifts
Detailed shift logs for each caregiver.
Used by agencies to track attendance and hours.

Columns:
- id: Unique identifier
- relationshipId: Links to relationship
- shiftDate: Date of shift
- startTime: Start time (HH:MM format)
- endTime: End time (HH:MM format)
- hoursWorked: Calculated hours
- status: completed | no_show | cancelled
- notes: Optional shift notes
- payAmount: Calculated pay for shift

### agency_ratings
Public attestations from agencies about caregivers.
Visible to ALL agencies and shown on caregiver profiles.

Columns:
- id: Unique identifier
- relationshipId: Links to relationship (one rating per relationship)
- agencyId: Which agency gave rating
- caregiverId: Which caregiver was rated
- reliability: 1-5 score
- punctuality: 1-5 score
- warmth: 1-5 score
- dignity: 1-5 score
- hygiene: 1-5 score
- skillsMatch: 1-5 score
- wouldReengage: Boolean (would hire again?)
- publicComment: Optional text (500 chars max)

### agency_saved_searches
Saved filter combinations for quick searching.

Columns:
- id: Unique identifier
- agencyId: Which agency saved this
- name: User-defined name
- filters: JSON blob of filter state
- resultCount: Cached count of matches
- lastUsedAt: Tracks usage for sorting
