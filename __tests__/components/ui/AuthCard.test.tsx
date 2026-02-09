import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AuthCard from '@/app/components/ui/AuthCard';

describe('AuthCard', () => {
  it('renders children', () => {
    render(
      <AuthCard>
        <p>Card content</p>
      </AuthCard>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders a single wrapper div', () => {
    const { container } = render(
      <AuthCard>
        <span>Child</span>
      </AuthCard>
    );
    expect(container.firstChild?.nodeName).toBe('DIV');
    expect(container.querySelector('span')).toHaveTextContent('Child');
  });

  it('applies rounded class when rounded=true', () => {
    const { container } = render(
      <AuthCard rounded>
        <span>Child</span>
      </AuthCard>
    );
    const div = container.firstChild as HTMLElement;
    expect(div.className).toMatch(/rounded-xl/);
  });

  it('applies optional className', () => {
    const { container } = render(
      <AuthCard className="complete-reg-form">
        <span>Child</span>
      </AuthCard>
    );
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain('complete-reg-form');
  });
});
