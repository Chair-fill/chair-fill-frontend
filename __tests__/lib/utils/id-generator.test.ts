import { describe, it, expect } from 'vitest';
import { generateContactId } from '@/lib/utils/id-generator';

describe('lib/utils/id-generator', () => {
  describe('generateContactId', () => {
    it('returns a string', () => {
      expect(typeof generateContactId()).toBe('string');
    });

    it('returns unique ids on multiple calls', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateContactId());
      }
      expect(ids.size).toBe(100);
    });

    it('format contains timestamp and random part', () => {
      const id = generateContactId();
      expect(id).toMatch(/^\d+-[a-z0-9]+$/);
    });
  });
});
