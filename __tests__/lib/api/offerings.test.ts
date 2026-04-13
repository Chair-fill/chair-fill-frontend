import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listOfferings, createOffering, updateOffering, deleteOffering } from '@/lib/api/offerings';
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

describe('lib/api/offerings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listOfferings', () => {
    it('throws error if neither technician_id nor shop_id is provided', async () => {
      await expect(listOfferings({} as any)).rejects.toThrow(
        'Either technician_id or shop_id is required to list offerings.'
      );
    });

    it('makes a GET request with technician_id', async () => {
      const mockData = [{ id: '1', name: 'Service 1', price: '20.00', duration: 30 }];
      (api.get as any).mockResolvedValue({ data: mockData });

      const result = await listOfferings({ technician_id: 'tech-1' });

      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining('technician_id=tech-1'),
        expect.any(Object)
      );
      expect(result).toEqual(mockData);
    });

    it('makes a GET request with shop_id', async () => {
      const mockData = [{ id: '2', name: 'Service 2', price: '30.00', duration: 45 }];
      (api.get as any).mockResolvedValue({ data: { data: mockData } }); // Test envelope unwrapping

      const result = await listOfferings({ shop_id: 'shop-1' });

      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining('shop_id=shop-1'),
        expect.any(Object)
      );
      expect(result).toEqual(mockData);
    });

    it('passes all query parameters correctly', async () => {
      (api.get as any).mockResolvedValue({ data: [] });

      await listOfferings({
        technician_id: 'tech-1',
        search: 'hair',
        page_size: 10,
        from: '2024-01-01',
      });

      const callUrl = (api.get as any).mock.calls[0][0];
      expect(callUrl).toContain('technician_id=tech-1');
      expect(callUrl).toContain('search=hair');
      expect(callUrl).toContain('page_size=10');
      expect(callUrl).toContain('from=2024-01-01');
    });
  });

  describe('createOffering', () => {
    it('sends the correct payload and returns unwrapped result', async () => {
      const body = {
        name: 'New Service',
        price: 50,
        duration: 60,
        technician_id: 'tech-1',
        description: 'A great service',
      };
      const mockResponse = { data: { id: 'new-id', ...body, price: '50.00' } };
      (api.post as any).mockResolvedValue({ data: mockResponse });

      const result = await createOffering(body);

      expect(api.post).toHaveBeenCalledWith(API.OFFERINGS.CREATE, {
        name: 'New Service',
        price: 50,
        duration: 60,
        technician_id: 'tech-1',
        description: 'A great service',
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateOffering', () => {
    it('sends the correct payload and returns unwrapped result', async () => {
      const body = {
        offering_id: 'offering-1',
        name: 'Updated Name',
        price: 60,
      };
      const mockResponse = { offering: { id: 'offering-1', name: 'Updated Name', price: '60.00' } };
      (api.put as any).mockResolvedValue({ data: mockResponse });

      const result = await updateOffering(body);

      expect(api.put).toHaveBeenCalledWith(API.OFFERINGS.UPDATE, body);
      expect(result).toEqual(mockResponse.offering);
    });
  });

  describe('deleteOffering', () => {
    it('calls the delete endpoint with the offering ID', async () => {
      (api.delete as any).mockResolvedValue({});

      await deleteOffering('offering-123');

      expect(api.delete).toHaveBeenCalledWith(API.OFFERINGS.DELETE('offering-123'));
    });
  });
});
