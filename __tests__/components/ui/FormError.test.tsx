import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FormError from '@/app/components/ui/FormError';

describe('FormError', () => {
  it('renders the error message', () => {
    render(<FormError message="Invalid email address" />);
    expect(screen.getByText('Invalid email address')).toBeInTheDocument();
  });

  it('applies error styling (has role/document structure)', () => {
    const { container } = render(<FormError message="Error" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.tagName).toBe('DIV');
    expect(wrapper.querySelector('p')).toHaveTextContent('Error');
  });

  it('renders empty message when passed empty string', () => {
    render(<FormError message="" />);
    const p = document.querySelector('p');
    expect(p).toBeInTheDocument();
    expect(p).toHaveTextContent('');
  });
});
