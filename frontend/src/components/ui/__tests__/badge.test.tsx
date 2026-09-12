import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Badge } from '../badge';

describe('Badge Component', () => {
  it('renders badge with label text', () => {
    render(<Badge>SCHEDULED</Badge>);

    const badge = screen.getByText('SCHEDULED');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-slot', 'badge');
    expect(badge).toHaveAttribute('data-variant', 'default');
  });

  it('renders different badge variants', () => {
    render(<Badge variant="secondary">INPROGRESS</Badge>);

    const badge = screen.getByText('INPROGRESS');
    expect(badge).toHaveAttribute('data-variant', 'secondary');
  });
});
