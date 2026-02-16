import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ArtworkCard from './components/ArtworkCard';
import ImageViewer from './components/ImageViewer';
import UploadModal from './components/UploadModal';
import { Artwork } from './types';
import { getAllArtworksFromStorage, saveArtworkToStorage } from './services/storageService';

// Hardcoded initial image as requested
const INITIAL_IMAGE_URL = "https://photos.fife.usercontent.google.com/pw/AP1GczP4fEP4JjW529eU8JjdFpqF8vpAV9ci9q8dxo3hwd1ZKFAZNGIAZ4w8eg=w1379-h1035-s-no?authuser=0";
const SUNSET_IMAGE_URL = "https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=1000&auto=format&fit=crop";

const App: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize with persisted data or defaults
  useEffect(() => {
    const loadArtworks = async () => {
      try {
        const storedArtworks = await getAllArtworksFromStorage();
        
        if (storedArtworks.length > 0) {
          setArtworks(storedArtworks);
        } else {
          // Default initial data if DB is empty
          const initialArtworks: Artwork[] = [
            {
              id: 'initial-1',
              url: INITIAL_IMAGE_URL,
              title: 'Provenance #1',
              description: 'The cornerstone of the collection. A study in texture and form that serves as the foundation for this digital archive.',
              medium: 'Mixed Media on Canvas',
              tags: ['Abstract', 'Contemporary', 'Featured'],
              year: '2024',
              dateAdded: Date.now()
            },
            {
              id: 'initial-2',
              url: SUNSET_IMAGE_URL,
              title: 'Evening Palms',
              description: 'A serene landscape capturing the warmth of a tropical sunset. Silhouetted palm trees and flying birds create a peaceful composition against the gradient sky.',
              medium: 'Acrylic on Canvas',
              tags: ['Landscape', 'Sunset', 'Nature'],
              year: '2023',
              dateAdded: Date.now() - 1000
            }
          ];
          setArtworks(initialArtworks);
          // Persist defaults
          for (const art of initialArtworks) {
            await saveArtworkToStorage(art);
          }
        }
      } catch (error) {
        console.error("Failed to load artworks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadArtworks();
  }, []);

  const handleUploadComplete = async (newArtwork: Artwork) => {
    // Optimistic UI update
    setArtworks((prev) => [newArtwork, ...prev]);
    setIsUploadModalOpen(false);
    
    // Persist to IndexedDB
    try {
      await saveArtworkToStorage(newArtwork);
    } catch (error) {
      console.error("Failed to save artwork persistence:", error);
      // We could revert state here if strict consistency is needed, 
      // but for this app keeping it in memory is better than crashing.
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      {/* Background Art Layer */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2500&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.25
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header onUploadClick={() => setIsUploadModalOpen(true)} />

        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-16">
            <span className="text-indigo-800 font-bold tracking-wider text-sm uppercase mb-2 inline-block px-4 py-1 rounded-full bg-white/50 backdrop-blur-sm shadow-sm">The Collection</span>
            <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-6 drop-shadow-sm">
              Radha's Collection
            </h2>
            <div className="max-w-2xl mx-auto bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/40">
              <p className="text-stone-700 font-light text-lg">
                Explore a digital gallery where traditional aesthetics meet modern curation. 
              </p>
            </div>
          </div>

          {/* Masonry-like grid using CSS columns for simplicity */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {artworks.map((art) => (
              <ArtworkCard 
                key={art.id} 
                artwork={art} 
                onClick={setSelectedArtwork} 
              />
            ))}
          </div>

          {/* Loading / Empty States */}
          {isLoading && artworks.length === 0 && (
             <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-xl border border-dashed border-stone-300">
                <p className="text-stone-500 animate-pulse">Loading collection...</p>
             </div>
          )}
          
          {!isLoading && artworks.length === 0 && (
             <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-xl border border-dashed border-stone-300">
                <p className="text-stone-500">No artworks found. Start by adding one!</p>
             </div>
          )}
        </main>

        <footer className="bg-stone-900/90 backdrop-blur text-stone-400 py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="font-serif text-lg text-stone-200 mb-2">Art<span className="font-light">Collection</span></p>
            <p className="text-sm opacity-60">&copy; {new Date().getFullYear()} Digital Art Portfolio. All rights reserved.</p>
          </div>
        </footer>
      </div>

      <ImageViewer 
        artwork={selectedArtwork} 
        onClose={() => setSelectedArtwork(null)} 
      />
      
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUploadComplete={handleUploadComplete} 
      />
    </div>
  );
};

export default App;