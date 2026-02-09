import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AuthLayout from '@/app/components/ui/AuthLayout';

describe('AuthLayout', () => {
  it('renders children', () => {
    render(
      <AuthLayout>
        <span>Auth content</span>
      </AuthLayout>
    );
    expect(screen.getByText('Auth content')).toBeInTheDocument();
  });

  it('has two wrapper divs (outer layout + inner max-width)', () => {
    const { container } = render(
      <AuthLayout>
        <div>Child</div>
      </AuthLayout>
    );
    const outer = container.firstChild as HTMLElement;
    expect(outer.tagName).toBe('DIV');
    const inner = outer.firstChild as HTMLElement;
    expect(inner.tagName).toBe('DIV');
    expect(inner).toHaveTextContent('Child');
  });

  it('applies optional className to outer div', () => {
    const { container } = render(
      <AuthLayout className="complete-registration-page">
        <div>Child</div>
      </AuthLayout>
    );
    const outer = container.firstChild as HTMLElement;
    expect(outer.className).toContain('complete-registration-page');
  });
});
