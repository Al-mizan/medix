import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Switch } from '../switch';

describe('Switch Component', () => {
    it('renders switch element', () => {
        render(<Switch aria-label="Toggle allergies" />);

        const switchElem = screen.getByRole('switch', { name: /Toggle allergies/i });
        expect(switchElem).toBeInTheDocument();
        expect(switchElem).toHaveAttribute('data-slot', 'switch');
    });

    it('handles checked state', () => {
        render(<Switch checked={true} aria-label="Toggle diabetes" />);

        const switchElem = screen.getByRole('switch', { name: /Toggle diabetes/i });
        expect(switchElem).toHaveAttribute('data-state', 'checked');
    });
});
