import { describe, it, expect } from 'vitest';
import { getApiErrorMessage, getResponseToken } from '@/lib/api-client';
import type { AxiosError } from 'axios';

describe('lib/api-client', () => {
  describe('getResponseToken', () => {
    it('returns token when data has token at top level', () => {
      expect(getResponseToken({ token: 'abc123' })).toBe('abc123');
    });

    it('returns token when data is nested under data', () => {
      expect(getResponseToken({ data: { token: 'nested-token' } })).toBe('nested-token');
    });

    it('returns undefined for null', () => {
      expect(getResponseToken(null)).toBeUndefined();
    });

    it('returns undefined for non-object', () => {
      expect(getResponseToken('string')).toBeUndefined();
      expect(getResponseToken(42)).toBeUndefined();
    });

    it('returns undefined when token is not a string', () => {
      expect(getResponseToken({ token: 123 })).toBeUndefined();
      expect(getResponseToken({ data: { token: null } })).toBeUndefined();
    });

    it('returns undefined for empty object', () => {
      expect(getResponseToken({})).toBeUndefined();
    });
  });

  describe('getApiErrorMessage', () => {
    it('returns string message from response data', () => {
      const err = {
        response: { data: { message: 'Invalid credentials' } },
        message: 'Request failed',
      } as AxiosError<{ message?: string }>;
      expect(getApiErrorMessage(err)).toBe('Invalid credentials');
    });

    it('returns first element when message is array (ValidationPipe)', () => {
      const err = {
        response: { data: { message: ['Email is required', 'Password too short'] } },
        message: 'Request failed',
      } as AxiosError<{ message?: string[] }>;
      expect(getApiErrorMessage(err)).toBe('Email is required');
    });

    it('returns fallback when message array is empty', () => {
      const err = {
        response: { data: { message: [] } },
        message: 'Request failed',
      } as AxiosError<{ message?: string[] }>;
      expect(getApiErrorMessage(err)).toBe('Something went wrong.');
    });

    it('returns error.message when no response data message', () => {
      const err = {
        response: { data: {} },
        message: 'Network Error',
      } as AxiosError<{ message?: string }>;
      expect(getApiErrorMessage(err)).toBe('Network Error');
    });

    it('returns default message for unknown error', () => {
      expect(getApiErrorMessage(new Error())).toBe('Something went wrong. Please try again.');
    });

    it('returns default for null/undefined', () => {
      expect(getApiErrorMessage(null)).toBe('Something went wrong. Please try again.');
    });
  });
});
