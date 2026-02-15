import { z } from 'zod';

export const AGE_RANGES = [
  '18-25',
  '26-35',
  '36-45',
  '46-55',
  '56-65',
  '65+',
] as const;

export const HEALTH_CONCERNS = [
  'Weight management',
  'Hormonal balance',
  'Energy & fatigue',
  'Digestive health',
  'Immune support',
  'Other',
] as const;

export const GENDERS = [
  'Male',
  'Female',
  'Prefer not to say',
] as const;

export const consultationSchema = z.object({
  fullName: z.string()
    .trim()
    .min(1, 'Full name is required')
    .max(100, 'Name must be less than 100 characters'),
  phone: z.string()
    .trim()
    .min(1, 'Phone number is required')
    .regex(/^\+\d{7,15}$/, 'Please enter a valid phone number'),
  email: z.string()
    .email('Please enter a valid email')
    .max(255, 'Email must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  ageRange: z.enum(AGE_RANGES, {
    errorMap: () => ({ message: 'Please select your age range' }),
  }),
  gender: z.enum(GENDERS).optional(),
  healthConcern: z.enum(HEALTH_CONCERNS, {
    errorMap: () => ({ message: 'Please select your primary health concern' }),
  }),
  message: z.string()
    .max(1000, 'Message must be less than 1000 characters')
    .optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must agree to be contacted via WhatsApp',
  }),
  honeypot: z.string().optional(),
});

export type ConsultationFormData = z.infer<typeof consultationSchema>;
