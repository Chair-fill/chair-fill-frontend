import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getToken,
  setToken,
  removeToken,
  isPublicRoute,
  isProtectedRoute,
  PUBLIC_ROUTES,
} from '@/lib/auth';

describe('lib/auth', () => {
  const originalSessionStorage = global.sessionStorage;

  beforeEach(() => {
    const store: Record<string, string> = {};
    global.sessionStorage = {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    } as unknown as Storage;
  });

  afterEach(() => {
    global.sessionStorage = originalSessionStorage;
    vi.clearAllMocks();
  });

  describe('getToken', () => {
    it('returns null when no token is stored', () => {
      expect(getToken()).toBeNull();
    });

    it('returns stored token', () => {
      setToken('abc123');
      expect(getToken()).toBe('abc123');
    });
  });

  describe('setToken', () => {
    it('stores the token in sessionStorage', () => {
      setToken('my-token');
      expect(getToken()).toBe('my-token');
    });
  });

  describe('removeToken', () => {
    it('removes the token from sessionStorage', () => {
      setToken('my-token');
      removeToken();
      expect(getToken()).toBeNull();
    });
  });

  describe('isPublicRoute', () => {
    it('returns true for /login', () => {
      expect(isPublicRoute('/login')).toBe(true);
    });

    it('returns true for /signup', () => {
      expect(isPublicRoute('/signup')).toBe(true);
    });

    it('returns true for /forgot-password', () => {
      expect(isPublicRoute('/forgot-password')).toBe(true);
    });

    it('returns true for paths under public routes', () => {
      expect(isPublicRoute('/login/foo')).toBe(true);
    });

    it('returns false for /contacts', () => {
      expect(isPublicRoute('/contacts')).toBe(false);
    });

    it('returns false for /profile', () => {
      expect(isPublicRoute('/profile')).toBe(false);
    });

    it('returns false for /', () => {
      expect(isPublicRoute('/')).toBe(false);
    });
  });

  describe('isProtectedRoute', () => {
    it('returns false for /login', () => {
      expect(isProtectedRoute('/login')).toBe(false);
    });

    it('returns false for /', () => {
      expect(isProtectedRoute('/')).toBe(false);
    });

    it('returns true for /contacts', () => {
      expect(isProtectedRoute('/contacts')).toBe(true);
    });

    it('returns true for /profile', () => {
      expect(isProtectedRoute('/profile')).toBe(true);
    });
  });

  describe('PUBLIC_ROUTES', () => {
    it('includes login, signup, forgot-password', () => {
      expect(PUBLIC_ROUTES).toContain('/login');
      expect(PUBLIC_ROUTES).toContain('/signup');
      expect(PUBLIC_ROUTES).toContain('/forgot-password');
    });
  });
});
