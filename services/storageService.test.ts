import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import type { Artwork } from '../types';
import {
  saveArtworkToStorage,
  getAllArtworksFromStorage,
} from './storageService';

const makeArtwork = (overrides: Partial<Artwork> = {}): Artwork => ({
  id: 'id-1',
  url: 'https://example.com/a.jpg',
  title: 'Title',
  description: 'Description',
  medium: 'Oil',
  tags: ['tag'],
  dateAdded: 1000,
  ...overrides,
});

describe('storageService', () => {
  beforeEach(() => {
    // Fresh in-memory IndexedDB for each test.
    (globalThis as unknown as { indexedDB: IDBFactory }).indexedDB = new IDBFactory();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('persists an artwork that can be read back', async () => {
    const art = makeArtwork();
    await saveArtworkToStorage(art);

    const stored = await getAllArtworksFromStorage();
    expect(stored).toHaveLength(1);
    expect(stored[0]).toEqual(art);
  });

  it('returns an empty array when the store has no artworks', async () => {
    const stored = await getAllArtworksFromStorage();
    expect(stored).toEqual([]);
  });

  it('upserts by id (put) rather than duplicating', async () => {
    await saveArtworkToStorage(makeArtwork({ title: 'Original' }));
    await saveArtworkToStorage(makeArtwork({ title: 'Updated' }));

    const stored = await getAllArtworksFromStorage();
    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe('Updated');
  });

  it('returns artworks sorted by dateAdded descending (newest first)', async () => {
    await saveArtworkToStorage(makeArtwork({ id: 'old', dateAdded: 100 }));
    await saveArtworkToStorage(makeArtwork({ id: 'new', dateAdded: 300 }));
    await saveArtworkToStorage(makeArtwork({ id: 'mid', dateAdded: 200 }));

    const stored = await getAllArtworksFromStorage();
    expect(stored.map((a) => a.id)).toEqual(['new', 'mid', 'old']);
  });

  it('rejects saving when IndexedDB is unavailable', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (globalThis as unknown as { indexedDB: IDBFactory | undefined }).indexedDB = undefined;

    await expect(saveArtworkToStorage(makeArtwork())).rejects.toThrow(
      'IndexedDB not supported',
    );
    expect(errorSpy).toHaveBeenCalled();
  });

  it('returns an empty array (not a throw) when reading fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (globalThis as unknown as { indexedDB: IDBFactory | undefined }).indexedDB = undefined;

    const stored = await getAllArtworksFromStorage();
    expect(stored).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
  });
});
