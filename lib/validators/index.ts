import { z } from 'zod';

export const registrationSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Full name must be at least 3 characters')
    .max(80, 'Name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),

  phone: z.string().regex(/^(\+234|0)[789][01]\d{8}$/, 'Enter a valid Nigerian phone number'),

  businessName: z
    .string()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name is too long'),

  category: z.enum([
    'electronics',
    'fashion',
    'food',
    'logistics',
    'beauty',
    'services',
    'groceries',
    'other',
  ]),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

export const documentSchema = z.object({
  documentType: z.enum(['nin', 'cac', 'utility']),
  documentUri: z.string().min(1, 'Please upload a document photo'),
});

export type DocumentFormData = z.infer<typeof documentSchema>;

export const selfieSchema = z.object({
  selfieUri: z.string().min(1, 'Please take a selfie photo'),
});

export type SelfieFormData = z.infer<typeof selfieSchema>;
