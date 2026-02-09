import { describe, it, expect } from 'vitest';
import { parseCSV, parseVCF } from '@/lib/utils/contact-parser';

describe('lib/utils/contact-parser', () => {
  describe('parseCSV', () => {
    it('returns empty array for empty string', () => {
      expect(parseCSV('')).toEqual([]);
    });

    it('returns empty array for whitespace-only lines', () => {
      expect(parseCSV('\n\n  \n')).toEqual([]);
    });

    it('parses CSV with name and email headers', () => {
      const csv = 'name,email\nJohn Doe,john@example.com\nJane,jane@example.com';
      const result = parseCSV(csv);
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ name: 'John Doe', email: 'john@example.com' });
      expect(result[1]).toMatchObject({ name: 'Jane', email: 'jane@example.com' });
    });

    it('matches headers case-insensitively', () => {
      const csv = 'Name,Email,Phone\nAlice,alice@test.com,555-1234';
      const result = parseCSV(csv);
      expect(result[0]).toMatchObject({ name: 'Alice', email: 'alice@test.com', phone: '555-1234' });
    });

    it('skips rows with no name and no email', () => {
      const csv = 'name,email\n, \nBob,bob@test.com';
      const result = parseCSV(csv);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Bob');
    });
  });

  describe('parseVCF', () => {
    it('returns empty array for empty string', () => {
      expect(parseVCF('')).toEqual([]);
    });

    it('parses a simple vCard with FN', () => {
      const vcf = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'FN:John Doe',
        'EMAIL:john@example.com',
        'TEL:555-1234',
        'END:VCARD',
      ].join('\n');
      const result = parseVCF(vcf);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('John Doe');
      expect(result[0].email).toBe('john@example.com');
      expect(result[0].phone).toBeTruthy();
    });

    it('parses multiple vCards', () => {
      const vcf = [
        'BEGIN:VCARD',
        'FN:First',
        'END:VCARD',
        'BEGIN:VCARD',
        'FN:Second',
        'END:VCARD',
      ].join('\n');
      const result = parseVCF(vcf);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('First');
      expect(result[1].name).toBe('Second');
    });
  });
});
