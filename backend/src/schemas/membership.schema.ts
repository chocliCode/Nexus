import { z } from 'zod';

export const updateMembershipSchema = z.object({
  membresia_id: z.string().uuid('ID de membresía inválido'),
});

export type UpdateMembershipInput = z.infer<typeof updateMembershipSchema>;
