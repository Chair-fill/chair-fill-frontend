import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCalendar } from '@/lib/api/calendar';
import { api } from '@/lib/api-client';
import { API } from '@/lib/constants/api';

// Mock the api-client
vi.mock('@/lib/api-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api-client')>();
  return {
    ...actual,
    api: {
      get: vi.fn(),
    },
    getApiErrorMessage: vi.fn((err: any) => err.message || 'Error'),
  };
});

describe('lib/api/calendar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCalendar', () => {
    it('throws error if neither technician_id nor shop_id is provided', async () => {
      await expect(getCalendar({} as any)).rejects.toThrow(
        'Either technician_id or shop_id is required to get calendar.'
      );
    });

    it('makes a GET request with technician_id', async () => {
      const mockResult = { bookings: [{ id: 'b1', name: 'Booking 1' }] };
      (api.get as any).mockResolvedValue({ data: mockResult });

      const result = await getCalendar({ technician_id: 'tech-1' });

      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('technician_id=tech-1'));
      expect(result).toEqual(mockResult);
    });

    it('unwraps data envelope if present', async () => {
      const mockResult = { days: [{ date: '2024-01-01', bookings: [] }] };
      (api.get as any).mockResolvedValue({ data: { data: mockResult } });

      const result = await getCalendar({ shop_id: 'shop-1' });

      expect(result).toEqual(mockResult);
    });

    it('handles api errors via getApiErrorMessage', async () => {
      (api.get as any).mockRejectedValue(new Error('Network Error'));

      await expect(getCalendar({ technician_id: 'tech-1' })).rejects.toThrow('Network Error');
    });
  });
});
