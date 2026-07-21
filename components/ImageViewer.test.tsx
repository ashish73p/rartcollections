import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageViewer from './ImageViewer';
import type { Artwork } from '../types';

const artwork: Artwork = {
  id: 'a1',
  url: 'https://example.com/piece.jpg',
  title: 'Silent Narratives',
  description: 'A compelling composition.',
  medium: 'Oil on Canvas',
  tags: ['Portrait', 'Realism'],
  year: '2024',
  dateAdded: 1000,
};

describe('ImageViewer', () => {
  it('renders nothing when no artwork is provided', () => {
    const { container } = render(
      <ImageViewer artwork={null} onClose={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders artwork details when an artwork is provided', () => {
    render(<ImageViewer artwork={artwork} onClose={() => {}} />);
    expect(screen.getByText('Silent Narratives')).toBeInTheDocument();
    expect(screen.getByText('A compelling composition.')).toBeInTheDocument();
    expect(screen.getByText('Oil on Canvas')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('renders each tag prefixed with a hash', () => {
    render(<ImageViewer artwork={artwork} onClose={() => {}} />);
    expect(screen.getByText('#Portrait')).toBeInTheDocument();
    expect(screen.getByText('#Realism')).toBeInTheDocument();
  });

  it('does not render the year row when year is absent', () => {
    const noYear: Artwork = { ...artwork, year: undefined };
    render(<ImageViewer artwork={noYear} onClose={() => {}} />);
    expect(screen.queryByText('2024')).not.toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<ImageViewer artwork={artwork} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <ImageViewer artwork={artwork} onClose={onClose} />,
    );
    const backdrop = container.querySelector('.absolute.inset-0');
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop as Element);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
