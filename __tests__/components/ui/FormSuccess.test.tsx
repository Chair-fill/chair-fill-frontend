import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FormSuccess from '@/app/components/ui/FormSuccess';

describe('FormSuccess', () => {
  it('renders the success message', () => {
    render(<FormSuccess message="Account created successfully." />);
    expect(screen.getByText('Account created successfully.')).toBeInTheDocument();
  });

  it('renders inside a div with paragraph', () => {
    const { container } = render(<FormSuccess message="Saved!" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.tagName).toBe('DIV');
    expect(wrapper.querySelector('p')).toHaveTextContent('Saved!');
  });
});
