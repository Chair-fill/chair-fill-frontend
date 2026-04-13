import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAvailability, updateAvailability, enquireDate } from '@/lib/api/availability';
import { api } from '@/lib/api-client';
import { API } from '@/lib/constants/api';

// Mock the api-client
vi.mock('@/lib/api-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api-client')>();
  return {
    ...actual,
    api: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
    getApiErrorMessage: vi.fn((err: any) => err.message || 'Error'),
  };
});

describe('lib/api/availability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAvailability', () => {
    it('throws error if neither technician_id nor shop_id is provided', async () => {
      await expect(getAvailability({} as any)).rejects.toThrow(
        'Either technician_id or shop_id is required to get availability.'
      );
    });

    it('makes a GET request with technician_id and date', async () => {
      const mockResult = { source: 'db', availability: { open_time: '08:00' } };
      (api.get as any).mockResolvedValue({ data: mockResult });

      const result = await getAvailability({ technician_id: 'tech-1', date: '2024-05-20' });

      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining('technician_id=tech-1'),
      );
      expect((api.get as any).mock.calls[0][0]).toContain('date=2024-05-20');
      expect(result).toEqual(mockResult);
    });

    it('unwraps data envelope if present', async () => {
      const mockResult = { source: 'cache', availability: { open_time: '10:00' } };
      (api.get as any).mockResolvedValue({ data: { data: mockResult } });

      const result = await getAvailability({ shop_id: 'shop-1' });

      expect(result).toEqual(mockResult);
    });
  });

  describe('updateAvailability', () => {
    it('sends correct payload for technician', async () => {
      const body = {
        technician_id: 'tech-1',
        availableTime: ['09:00', '17:00'] as [string, string],
        period: 'only_on_day' as const,
        date: '2024-12-25',
      };
      (api.put as any).mockResolvedValue({ data: { success: true } });

      await updateAvailability(body);

      expect(api.put).toHaveBeenCalledWith(API.AVAILABILITY.UPDATE, expect.objectContaining({
        technician_id: 'tech-1',
        availableTime: ['09:00', '17:00'],
        period: 'only_on_day',
        date: '2024-12-25',
      }));
    });
  });

  describe('enquireDate', () => {
    it('returns available_times from response data', async () => {
      const mockRanges = [[480, 720], [810, 1025]];
      (api.get as any).mockResolvedValue({ data: { data: { available_times: mockRanges } } });

      const result = await enquireDate('tech-1', new Date('2026-04-14'));
      expect(result).toEqual(mockRanges);
    });

    it('returns empty array on error', async () => {
      (api.get as any).mockRejectedValue(new Error('Network error'));

      const result = await enquireDate('tech-1', new Date('2026-04-14'));
      expect(result).toEqual([]);
    });
  });
});
