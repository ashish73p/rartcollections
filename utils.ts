import { Artwork } from './types';

export const sortArtworksByNewest = <T extends Pick<Artwork, 'dateAdded'>>(artworks: T[]): T[] =>
  artworks.sort((a, b) => b.dateAdded - a.dateAdded);
