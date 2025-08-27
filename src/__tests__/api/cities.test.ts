import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from '@/app/api/cities/route';
import { getAllCities, createCity } from '@/lib/db';
import { invalidateCitiesCache } from '@/lib/cache';

// Mock des dépendances
vi.mock('@/lib/db');
vi.mock('@/lib/cache');
vi.mock('@/lib/logger');

const mockGetAllCities = vi.mocked(getAllCities);
const mockCreateCity = vi.mocked(createCity);
const mockInvalidateCitiesCache = vi.mocked(invalidateCitiesCache);

describe('/api/cities', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('GET', () => {
    it('should return cities successfully', async () => {
      const mockCities = [
        { id: '1', name: 'Paris', slug: 'paris' },
        { id: '2', name: 'Lyon', slug: 'lyon' }
      ];
      
      mockGetAllCities.mockResolvedValue(mockCities as any);
      
      const response = await GET();
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockCities);
      expect(mockGetAllCities).toHaveBeenCalledOnce();
    });

    it('should handle database errors', async () => {
      mockGetAllCities.mockRejectedValue(new Error('Database error'));
      
      const response = await GET();
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error).toBe(true);
      expect(data.message).toContain('erreur');
    });
  });

  describe('POST', () => {
    it('should create city successfully', async () => {
      const newCity = { id: '3', name: 'Marseille', slug: 'marseille' };
      const requestData = { name: 'Marseille', slug: 'marseille' };
      
      mockCreateCity.mockResolvedValue(newCity as any);
      
      const request = new Request('http://localhost/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.data).toEqual(newCity);
      expect(mockCreateCity).toHaveBeenCalledWith(requestData);
      expect(mockInvalidateCitiesCache).toHaveBeenCalledOnce();
    });

    it('should validate required fields', async () => {
      const request = new Request('http://localhost/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' }) // Missing slug
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe(true);
      expect(mockCreateCity).not.toHaveBeenCalled();
    });

    it('should validate slug format', async () => {
      const request = new Request('http://localhost/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: 'Test City', 
          slug: 'Invalid Slug!' // Invalid characters
        })
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe(true);
      expect(mockCreateCity).not.toHaveBeenCalled();
    });

    it('should handle duplicate slug error', async () => {
      const duplicateError = new Error('Duplicate');
      (duplicateError as any).code = 'P2002';
      
      mockCreateCity.mockRejectedValue(duplicateError);
      
      const request = new Request('http://localhost/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test', slug: 'test' })
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(409);
      expect(data.error).toBe(true);
      expect(data.message).toContain('existe déjà');
    });

    it('should handle invalid JSON', async () => {
      const request = new Request('http://localhost/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe(true);
      expect(mockCreateCity).not.toHaveBeenCalled();
    });
  });
});
