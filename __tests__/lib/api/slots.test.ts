import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSlots } from '@/lib/api/slots';
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

describe('lib/api/slots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSlots', () => {
    it('throws error if neither technician_id nor shop_id is provided', async () => {
      await expect(getSlots({} as any)).rejects.toThrow(
        'Either technician_id or shop_id is required to get slots.'
      );
    });

    it('returns array directly if backend returns array', async () => {
      const mockSlots = [{ id: 's1', name: 'Slot 1' }];
      (api.get as any).mockResolvedValue({ data: mockSlots });

      const result = await getSlots({ technician_id: 'tech-1' });

      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('technician_id=tech-1'));
      expect(result).toEqual(mockSlots);
    });

    it('unwraps data.slots envelope', async () => {
      const mockSlots = [{ id: 's2', name: 'Slot 2' }];
      (api.get as any).mockResolvedValue({ data: { slots: mockSlots } });

      const result = await getSlots({ shop_id: 'shop-1' });

      expect(result).toEqual(mockSlots);
    });

    it('unwraps data.data.slots envelope (common NestJS pattern)', async () => {
      const mockSlots = [{ id: 's3', name: 'Slot 3' }];
      (api.get as any).mockResolvedValue({ data: { data: { slots: mockSlots } } });

      const result = await getSlots({ technician_id: 'tech-2' });

      expect(result).toEqual(mockSlots);
    });

    it('returns empty array if normalization fails', async () => {
      (api.get as any).mockResolvedValue({ data: { something_else: true } });

      const result = await getSlots({ shop_id: 'shop-2' });

      expect(result).toEqual([]);
    });

    it('handles api errors via getApiErrorMessage', async () => {
      (api.get as any).mockRejectedValue(new Error('Network Error'));

      await expect(getSlots({ technician_id: 'tech-1' })).rejects.toThrow('Network Error');
    });
  });
});
