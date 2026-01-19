import { z } from 'zod';

export const businessRegistrationSchema = z.object({
  full_name: z.string()
    .trim()
    .min(1, 'Full name is required')
    .max(200, 'Name must be less than 200 characters'),
  phone: z.string()
    .trim()
    .min(1, 'Phone number is required')
    .regex(/^(?:\+254|0)[17]\d{8}$/, 'Please enter a valid Kenyan phone number (e.g., 0712345678 or +254712345678)'),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  county_city: z.string()
    .trim()
    .min(1, 'County/City is required')
    .max(100, 'County/City must be less than 100 characters'),
  has_sponsor: z.boolean(),
  sponsor_name: z.string()
    .trim()
    .max(200, 'Sponsor name must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  sponsor_phone: z.string()
    .trim()
    .regex(/^(?:\+254|0)[17]\d{8}$/, 'Please enter a valid Kenyan phone number')
    .optional()
    .or(z.literal('')),
  sponsor_membership_id: z.string()
    .trim()
    .max(50, 'Membership ID must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  agreement_accepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the agreement to proceed' }),
  }),
}).refine((data) => {
  if (data.has_sponsor) {
    return data.sponsor_name && data.sponsor_name.trim().length > 0;
  }
  return true;
}, {
  message: 'Sponsor name is required when you have a sponsor',
  path: ['sponsor_name'],
}).refine((data) => {
  if (data.has_sponsor) {
    return data.sponsor_phone && data.sponsor_phone.trim().length > 0;
  }
  return true;
}, {
  message: 'Sponsor phone is required when you have a sponsor',
  path: ['sponsor_phone'],
});

export type BusinessRegistrationFormData = z.infer<typeof businessRegistrationSchema>;
