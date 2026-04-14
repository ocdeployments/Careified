import { z } from 'zod';

export const agencySignupSchema = z.object({
 // Agency info
 agencyName: z.string()
  .min(2, "Agency name must be at least 2 characters")
  .max(100, "Agency name too long"),
 businessType: z.string().optional(),
 licenseNumber: z.string().optional(),
 
 // Contact person
 contactFirstName: z.string()
  .min(2, "First name required")
  .max(50, "First name too long"),
 contactLastName: z.string()
  .min(2, "Last name required")
  .max(50, "Last name too long"),
 contactEmail: z.string()
  .email("Valid email required")
  .toLowerCase(),
 contactPhone: z.string()
  .regex(/^\(\d{3}\) \d{3}-\d{4}$/, "Phone format: (XXX) XXX-XXXX"),
 
 // Business address
 streetAddress: z.string()
  .min(5, "Street address required")
  .max(200, "Address too long"),
 city: z.string()
  .min(2, "City required")
  .max(100, "City name too long"),
 state: z.string()
  .length(2, "State required"),
 postalCode: z.string()
  .regex(/^\d{5}$/, "5-digit ZIP code required"),
 
 // Terms
 acceptedTerms: z.boolean()
  .refine(val => val === true, "You must accept terms to continue")
});

export type AgencySignupData = z.infer<typeof agencySignupSchema>;
