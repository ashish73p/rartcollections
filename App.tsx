import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ArtworkCard from './components/ArtworkCard';
import ImageViewer from './components/ImageViewer';
import { Artwork } from './types';
import { getAllArtworksFromStorage, saveArtworkToStorage } from './services/storageService';

// Initial Images
const SUNSET_IMAGE_URL = "https://raw.githubusercontent.com/ashish73p/rartcollections/main/Images/Collection1.jpg";
const PORTRAIT_URL = "https://raw.githubusercontent.com/ashish73p/rartcollections/main/Images/Collection2.jpg";


const App: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize with persisted data or defaults
  useEffect(() => {
    const loadArtworks = async () => {
      try {
        const storedArtworks = await getAllArtworksFromStorage();
        
        if (storedArtworks.length > 0) {
          // Filter out the removed "Provenance #1" (initial-1) and "Classical Fragment" (initial-3)
          // And update "Evening Palms" (initial-2) and "Ethereal Gaze" (initial-4) with new details
          const validArtworks = storedArtworks
            .filter(art => art.id !== 'initial-1' && art.id !== 'initial-3')
            .map(art => {
              if (art.id === 'initial-2') {
                return { 
                  ...art, 
                  url: SUNSET_IMAGE_URL,
                  title: 'Chromatic Resonance',
                  description: 'An immersive study of color dynamics, where vibrant hues interact to create a visual symphony that resonates with the viewer\'s emotions.'
                };
              }
              if (art.id === 'initial-4') {
                return {
                  ...art,
                  url: PORTRAIT_URL,
                  title: 'Silent Narratives',
                  description: 'A compelling composition that hints at untold stories, using texture and contrast to invite the observer into a deeper dialogue with the artwork.'
                };
              }
              return art;
            });

          setArtworks(validArtworks);

          // Persist the updates silently
          validArtworks.forEach(art => {
            if (art.id === 'initial-2' || art.id === 'initial-4') {
               saveArtworkToStorage(art).catch(e => console.error("Failed to update artwork record", e));
            }
          });

        } else {
          // Default initial data if DB is empty
          const initialArtworks: Artwork[] = [
            {
              id: 'initial-2',
              url: SUNSET_IMAGE_URL,
              title: 'Chromatic Resonance',
              description: 'An immersive study of color dynamics, where vibrant hues interact to create a visual symphony that resonates with the viewer\'s emotions.',
              medium: 'Mixed Media on Canvas',
              tags: ['Abstract', 'Color', 'Expressionism'],
              year: '2023',
              dateAdded: Date.now() - 1000
            },
            {
              id: 'initial-4',
              url: PORTRAIT_URL,
              title: 'Silent Narratives',
              description: 'A compelling composition that hints at untold stories, using texture and contrast to invite the observer into a deeper dialogue with the artwork.',
              medium: 'Oil on Canvas',
              tags: ['Portrait', 'Realism', 'Atmospheric'],
              year: '2024',
              dateAdded: Date.now() - 3000
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

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 relative">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-16">
            <span className="text-indigo-800 font-bold tracking-wider text-sm uppercase mb-2 inline-block px-4 py-1 rounded-full bg-white shadow-sm border border-indigo-100">The Collection</span>
            <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-6">
              Radha's Collection
            </h2>
            <div className="max-w-2xl mx-auto p-6">
              <p className="text-stone-600 font-light text-lg">
                Explore a digital gallery where traditional aesthetics meet modern curation. 
              </p>
            </div>
          </div>

          {/* Grid Layout for Horizontal Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {artworks.map((art) => (
              <ArtworkCard 
                key={art.id} 
                artwork={art} 
                //onClick={setSelectedArtwork} 
              />
            ))}
          </div>

          {/* Loading / Empty States */}
          {isLoading && artworks.length === 0 && (
             <div className="text-center py-20 bg-white rounded-xl border border-dashed border-stone-300">
                <p className="text-stone-500 animate-pulse">Loading collection...</p>
             </div>
          )}
          
          {!isLoading && artworks.length === 0 && (
             <div className="text-center py-20 bg-white rounded-xl border border-dashed border-stone-300">
                <p className="text-stone-500">No artworks found.</p>
             </div>
          )}
        </main>

        <footer className="bg-stone-900 text-stone-400 py-12 mt-auto">
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
    </div>
  );
};

export default App;