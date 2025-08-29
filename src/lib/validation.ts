import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
const timeRegex = /^\d{2}:\d{2}$/; // HH:MM

export const customerCreateSchema = z.object({
  firstName: z.string().trim().min(1, 'First name required'),
  lastName: z.string().trim().min(1, 'Last name required'),
  email: z.string().email(),
  mobile: z.string().trim().optional().default(''),
  dateOfBirth: z.string().regex(dateRegex, 'Invalid date format YYYY-MM-DD').optional().or(z.literal('')).default(''),
  address: z.string().optional().default(''),
  city: z.string().optional().default(''),
  state: z.string().optional().default(''),
  zipCode: z.string().optional().default(''),
  status: z.enum(['active','inactive']).optional().default('active'),
  notes: z.string().optional().default('')
});

export const customerUpdateSchema = customerCreateSchema.partial();

export const activityNoteCreateSchema = z.object({
  customerId: z.string().min(1),
  type: z.string().min(1),
  description: z.string().min(1),
  date: z.string().regex(dateRegex).optional(),
  time: z.string().regex(timeRegex).optional()
});

export const settingSchema = z.object({
  key: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean()]).transform(v => String(v)),
  category: z.string().min(1)
});

export const bulkSettingsSchema = z.object({
  settings: z.array(settingSchema)
});

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;

export function parseOrError<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors } as const;
  }
  return { data: result.data } as const;
}
