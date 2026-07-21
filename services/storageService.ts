import { Artwork } from '../types';
import { sortArtworksByNewest } from '../utils';

const DB_NAME = 'ArtCollectionDB';
const STORE_NAME = 'artworks';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB not supported"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

const promisifyRequest = <T>(request: IDBRequest<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

const withStore = async <T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> => {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, mode);
  const store = transaction.objectStore(STORE_NAME);
  return promisifyRequest(action(store));
};

export const saveArtworkToStorage = async (artwork: Artwork): Promise<void> => {
  try {
    await withStore('readwrite', (store) => store.put(artwork));
  } catch (error) {
    console.error("Failed to save artwork to storage:", error);
    throw error;
  }
};

export const getAllArtworksFromStorage = async (): Promise<Artwork[]> => {
  try {
    const results = await withStore<Artwork[]>('readonly', (store) => store.getAll());
    // Sort by dateAdded descending (newest first)
    return sortArtworksByNewest(results);
  } catch (error) {
    console.error("Failed to get artworks from storage:", error);
    return [];
  }
};
