import { describe, it, expect, vi } from 'vitest';
import { formatTime } from '../utils/datetime';

describe('datetime utils', () => {
  it('formatTime returns empty string for empty input', () => {
    expect(formatTime('')).toBe('');
  });

  it('formatTime returns input for invalid date', () => {
    expect(formatTime('not-a-date')).toBe('not-a-date');
  });

  it('formatTime formats a valid ISO date without timezone', () => {
    const result = formatTime('2024-01-01T10:00:00Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('formatTime formats a valid ISO date with timezone', () => {
    const result = formatTime('2024-01-01T10:00:00Z', 'Europe/Berlin');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('formatTime with null timezone formats without timezone', () => {
    const result = formatTime('2024-01-01T10:00:00Z', null);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});