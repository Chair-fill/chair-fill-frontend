import { describe, it, expect } from 'vitest';
import {
  AUTH_LAYOUT,
  AUTH_CARD,
  FORM_LABEL,
  INPUT_LEFT_ICON,
  BTN_PRIMARY,
  BTN_SECONDARY,
  FORM_ERROR_BOX,
  FORM_SUCCESS_BOX,
} from '@/lib/constants/ui';

describe('lib/constants/ui', () => {
  it('AUTH_LAYOUT contains expected classes', () => {
    expect(AUTH_LAYOUT).toContain('min-h-screen');
    expect(AUTH_LAYOUT).toContain('flex');
  });

  it('AUTH_CARD contains expected classes', () => {
    expect(AUTH_CARD).toContain('bg-white');
    expect(AUTH_CARD).toContain('rounded-lg');
  });

  it('FORM_LABEL contains block and text-sm', () => {
    expect(FORM_LABEL).toContain('block');
    expect(FORM_LABEL).toContain('text-sm');
  });

  it('INPUT_LEFT_ICON contains pl-10', () => {
    expect(INPUT_LEFT_ICON).toContain('pl-10');
  });

  it('BTN_PRIMARY contains primary button styles', () => {
    expect(BTN_PRIMARY).toContain('bg-zinc-900');
    expect(BTN_PRIMARY).toContain('rounded-lg');
  });

  it('BTN_SECONDARY contains border styles', () => {
    expect(BTN_SECONDARY).toContain('border');
  });

  it('FORM_ERROR_BOX contains red styling', () => {
    expect(FORM_ERROR_BOX).toContain('red');
  });

  it('FORM_SUCCESS_BOX contains emerald styling', () => {
    expect(FORM_SUCCESS_BOX).toContain('emerald');
  });
});
