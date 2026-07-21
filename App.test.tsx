import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import {
  getAllArtworksFromStorage,
  saveArtworkToStorage,
} from './services/storageService';
import type { Artwork } from './types';

vi.mock('./services/storageService', () => ({
  getAllArtworksFromStorage: vi.fn(),
  saveArtworkToStorage: vi.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    vi.mocked(getAllArtworksFromStorage).mockReset();
    vi.mocked(saveArtworkToStorage).mockReset();
    vi.mocked(saveArtworkToStorage).mockResolvedValue();
  });

  it('renders the header and hero copy', async () => {
    vi.mocked(getAllArtworksFromStorage).mockResolvedValue([]);
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(await screen.findByText("Radha's Collection")).toBeInTheDocument();
  });

  it('seeds the 12 default artworks into storage when none are stored', async () => {
    vi.mocked(getAllArtworksFromStorage).mockResolvedValue([]);
    render(<App />);

    await waitFor(() =>
      expect(saveArtworkToStorage).toHaveBeenCalledTimes(12),
    );
    expect(await screen.findByText('Chromatic Resonance')).toBeInTheDocument();
    expect(screen.getByText('Timeless Gaze')).toBeInTheDocument();
  });

  it('merges stored artworks with defaults and sorts newest first', async () => {
    const custom: Artwork = {
      id: 'custom-1',
      url: 'https://example.com/custom.jpg',
      title: 'My Custom Piece',
      description: 'desc',
      medium: 'Digital',
      tags: ['custom'],
      dateAdded: Date.now() + 100000,
    };
    vi.mocked(getAllArtworksFromStorage).mockResolvedValue([custom]);

    render(<App />);

    const heading = await screen.findByText('My Custom Piece');
    expect(heading).toBeInTheDocument();
    // Default artworks should still be present alongside the stored one.
    expect(screen.getByText('Chromatic Resonance')).toBeInTheDocument();
  });

  it('does not re-save defaults that already exist in storage', async () => {
    const existingDefault: Artwork = {
      id: 'initial-1',
      url: 'https://raw.githubusercontent.com/ashish73p/rartcollections/main/Images/Collection1.jpg',
      title: 'Chromatic Resonance',
      description: 'desc',
      medium: 'Mixed Media on Canvas',
      tags: ['Abstract'],
      dateAdded: 5000,
    };
    vi.mocked(getAllArtworksFromStorage).mockResolvedValue([existingDefault]);

    render(<App />);

    await screen.findByText("Radha's Collection");
    // 12 defaults minus the 1 already present = 11 saves.
    await waitFor(() =>
      expect(saveArtworkToStorage).toHaveBeenCalledTimes(11),
    );
  });

  it('still renders (with logged error) when storage rejects', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(getAllArtworksFromStorage).mockRejectedValue(
      new Error('db failure'),
    );

    render(<App />);

    await waitFor(() => expect(errorSpy).toHaveBeenCalled());
    expect(screen.getByRole('banner')).toBeInTheDocument();
    errorSpy.mockRestore();
  });
});
