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
      const mockResult = { 
        id: 'CAL-1',
        total_bookings: 1,
        total_cancelled_bookings: 0,
        daily_entries: {
          '2024-01-01': {
            bookings: [],
            open_time: '09:00',
            close_time: '17:00',
            availability: {
              evening: true,
              morning: true,
              afternoon: true,
              off_times: [],
              open_time: '09:00',
              close_time: '17:00'
            },
            total_bookings: 0,
            availability_modified: false,
            total_cancelled_bookings: 0
          }
        },
        monthly_entries: {},
        yearly_entries: {}
      };
      (api.get as any).mockResolvedValue({ data: mockResult });

      const result = await getCalendar({ technician_id: 'tech-1' });

      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('technician_id=tech-1'));
      expect(result).toEqual(mockResult);
    });

    it('unwraps data envelope if present', async () => {
      const mockResult = { 
        id: 'CAL-1',
        total_bookings: 0,
        total_cancelled_bookings: 0,
        daily_entries: {},
        monthly_entries: {},
        yearly_entries: {}
      };
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
