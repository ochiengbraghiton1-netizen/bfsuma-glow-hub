import { z } from 'zod';

// Product validation schema
export const productSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Product name is required')
    .max(200, 'Product name must be less than 200 characters'),
  price: z.string()
    .min(1, 'Price is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, 'Price must be a positive number')
    .refine((val) => {
      const num = parseFloat(val);
      return num <= 10000000;
    }, 'Price must be less than 10,000,000'),
  benefit: z.string().max(500, 'Benefit must be less than 500 characters').optional(),
  description: z.string().max(5000, 'Description must be less than 5000 characters').optional(),
  image_url: z.string()
    .max(2000, 'Image URL must be less than 2000 characters')
    .refine((val) => !val || val.startsWith('https://') || val.startsWith('http://'), 
      'Image URL must be a valid URL')
    .nullable()
    .optional(),
  is_active: z.boolean(),
});

// Team member validation schema
export const teamMemberSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(200, 'Name must be less than 200 characters'),
  phone: z.string()
    .trim()
    .min(1, 'Phone is required')
    .max(30, 'Phone must be less than 30 characters')
    .regex(/^[+\d\s()-]+$/, 'Phone must contain only valid phone characters'),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  joined_date: z.string().min(1, 'Joined date is required'),
  status: z.enum(['active', 'inactive', 'pending'], {
    errorMap: () => ({ message: 'Status must be active, inactive, or pending' }),
  }),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
});

// Consultation status validation schema
export const consultationStatusSchema = z.enum(['pending', 'confirmed', 'completed', 'cancelled'], {
  errorMap: () => ({ message: 'Invalid status' }),
});

// Site content validation schema
export const siteContentSchema = z.object({
  title: z.string().max(200, 'Title must be less than 200 characters').optional(),
  subtitle: z.string().max(500, 'Subtitle must be less than 500 characters').optional(),
  content: z.string().max(10000, 'Content must be less than 10000 characters').optional(),
  image_url: z.string()
    .max(2000, 'Image URL must be less than 2000 characters')
    .refine((val) => !val || val.startsWith('https://') || val.startsWith('http://'), 
      'Image URL must be a valid URL')
    .optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type TeamMemberFormData = z.infer<typeof teamMemberSchema>;
export type SiteContentFormData = z.infer<typeof siteContentSchema>;
