import { updateMembershipSchema } from '../../../src/schemas/membership.schema';

describe('Membership Schema Unit Tests', () => {
  it('should validate a valid UUID', () => {
    const validData = { membresia_id: '123e4567-e89b-12d3-a456-426614174000' };
    const result = updateMembershipSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject an invalid UUID', () => {
    const invalidData = { membresia_id: 'invalid-uuid' };
    const result = updateMembershipSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('ID de membresía inválido');
    }
  });

  it('should reject if membresia_id is missing', () => {
    const invalidData = {};
    const result = updateMembershipSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
