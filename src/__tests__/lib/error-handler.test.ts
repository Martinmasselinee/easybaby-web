import { describe, it, expect } from 'vitest';
import {
  AppError,
  createError,
  handleApiError,
  errorCodes,
  errorMessages,
  useErrorHandler,
  withRetry
} from '@/lib/error-handler';

describe('Error Handler', () => {
  describe('AppError', () => {
    it('should create error with default values', () => {
      const error = new AppError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.status).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.name).toBe('AppError');
    });

    it('should create error with custom values', () => {
      const error = new AppError('Custom error', 400, 'CUSTOM_CODE', { extra: 'data' });
      
      expect(error.message).toBe('Custom error');
      expect(error.status).toBe(400);
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.details).toEqual({ extra: 'data' });
    });
  });

  describe('createError', () => {
    it('should create error with default message', () => {
      const error = createError('VALIDATION_ERROR');
      
      expect(error.message).toBe(errorMessages.VALIDATION_ERROR);
      expect(error.status).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should create error with custom message', () => {
      const error = createError('NOT_FOUND', 'Custom not found message');
      
      expect(error.message).toBe('Custom not found message');
      expect(error.status).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should create error with details', () => {
      const details = { field: 'email', value: 'invalid' };
      const error = createError('VALIDATION_ERROR', 'Invalid email', details);
      
      expect(error.message).toBe('Invalid email');
      expect(error.details).toEqual(details);
    });
  });

  describe('handleApiError', () => {
    it('should handle AppError correctly', () => {
      const appError = new AppError('Test error', 400, 'TEST_CODE');
      const result = handleApiError(appError);
      
      expect(result.message).toBe('Test error');
      expect(result.code).toBe('TEST_CODE');
      expect(result.status).toBe(400);
    });

    it('should handle regular Error', () => {
      const error = new Error('Regular error');
      const result = handleApiError(error);
      
      expect(result.message).toBe('Une erreur inattendue s\'est produite');
      expect(result.code).toBe('INTERNAL_ERROR');
      expect(result.status).toBe(500);
    });

    it('should handle unknown error', () => {
      const result = handleApiError('string error');
      
      expect(result.message).toBe('Une erreur inconnue s\'est produite');
      expect(result.code).toBe('INTERNAL_ERROR');
      expect(result.status).toBe(500);
    });
  });

  describe('useErrorHandler', () => {
    it('should handle error with response data', () => {
      const { handleError } = useErrorHandler();
      
      const error = {
        response: {
          data: {
            message: 'API error message'
          }
        }
      };
      
      const result = handleError(error);
      expect(result).toBe('API error message');
    });

    it('should handle error with message', () => {
      const { handleError } = useErrorHandler();
      
      const error = {
        message: 'Direct error message'
      };
      
      const result = handleError(error);
      expect(result).toBe('Direct error message');
    });

    it('should handle error with status code', () => {
      const { handleError } = useErrorHandler();
      
      const error = {
        response: {
          status: 404
        }
      };
      
      const result = handleError(error);
      expect(result).toBe('Ressource introuvable');
    });

    it('should return default message for unknown error', () => {
      const { handleError } = useErrorHandler();
      
      const result = handleError({});
      expect(result).toBe('Une erreur inattendue s\'est produite');
    });
  });

  describe('withRetry', () => {
    it('should succeed on first try', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      
      const result = await withRetry(mockFn, 3, 100);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success');
      
      const result = await withRetry(mockFn, 3, 100);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should not retry for certain status codes', async () => {
      const appError = new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const mockFn = vi.fn().mockRejectedValue(appError);
      
      await expect(withRetry(mockFn, 3, 100)).rejects.toThrow(appError);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should fail after max retries', async () => {
      const error = new Error('Persistent failure');
      const mockFn = vi.fn().mockRejectedValue(error);
      
      await expect(withRetry(mockFn, 2, 100)).rejects.toThrow(error);
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });
});
