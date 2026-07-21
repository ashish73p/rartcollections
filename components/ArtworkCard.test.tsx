import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ArtworkCard from './ArtworkCard';
import type { Artwork } from '../types';

const artwork: Artwork = {
  id: 'a1',
  url: 'https://example.com/piece.jpg',
  title: 'Chromatic Resonance',
  description: 'An immersive study of color dynamics.',
  medium: 'Mixed Media on Canvas',
  tags: ['Abstract', 'Color'],
  year: '2023',
  dateAdded: 1000,
};

describe('ArtworkCard', () => {
  it('renders the artwork title, medium and description', () => {
    render(<ArtworkCard artwork={artwork} />);
    expect(screen.getByText('Chromatic Resonance')).toBeInTheDocument();
    expect(screen.getByText('Mixed Media on Canvas')).toBeInTheDocument();
    expect(
      screen.getByText('An immersive study of color dynamics.'),
    ).toBeInTheDocument();
  });

  it('renders the image with correct src and alt', () => {
    render(<ArtworkCard artwork={artwork} />);
    const img = screen.getByRole('img', { name: 'Chromatic Resonance' });
    expect(img).toHaveAttribute('src', artwork.url);
  });

  it('reveals the image (opacity-100) once it has loaded', () => {
    render(<ArtworkCard artwork={artwork} />);
    const img = screen.getByRole('img', { name: 'Chromatic Resonance' });
    expect(img.className).toContain('opacity-0');

    fireEvent.load(img);
    expect(img.className).toContain('opacity-100');
  });
});
