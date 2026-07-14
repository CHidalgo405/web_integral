import { describe, expect, it } from 'vitest';
import { daysUntilExpiration } from './expirations';

describe('daysUntilExpiration', () => {
  const today = new Date(2026, 6, 14, 12);

  it('supports PostgreSQL ISO date strings', () => {
    expect(daysUntilExpiration('2026-07-17T00:00:00.000Z', today)).toBe(3);
  });

  it('supports date-only strings', () => {
    expect(daysUntilExpiration('2026-07-13', today)).toBe(-1);
  });

  it('does not return NaN for invalid values', () => {
    expect(daysUntilExpiration('not-a-date', today)).toBeNull();
  });
});
