import { validateRequest } from '@/lib/auth';
import { z } from 'zod';

const new_drill_form_schema = z.object({
  date: z.string().date().min(1),
  price: z.number().int().min(1),
  player_capacity: z.number().int().min(2),
  location: z.string().min(1),
});

export async function new_drill_action(form_data: FormData) {
  'use server';

  const { user } = await validateRequest();

  if (!user || user.role !== 'admin') {
    return {
      error: 'Unauthorized',
    };
  }
  const {
    success: form_parse_success,
    data,
    error: form_error,
  } = new_drill_form_schema.safeParse(Object.fromEntries(form_data.entries()));

  if (!form_parse_success) {
    return { error: form_error };
  }
}
