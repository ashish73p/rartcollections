import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ArtworkCard from './components/ArtworkCard';
import ImageViewer from './components/ImageViewer';
import UploadModal from './components/UploadModal';
import { Artwork } from './types';
import { getAllArtworksFromStorage, saveArtworkToStorage } from './services/storageService';

const BASE_IMAGE_URL = "https://raw.githubusercontent.com/ashish73p/rartcollections/main/Images";

// Extended collection of default artworks
const DEFAULT_ARTWORKS: Artwork[] = [
  {
    id: 'initial-1', 
    url: `${BASE_IMAGE_URL}/Collection1.jpg`,
    title: 'Chromatic Resonance',
    description: 'An immersive study of color dynamics, where vibrant hues interact to create a visual symphony that resonates with the viewer\'s emotions.',
    medium: 'Mixed Media on Canvas',
    tags: ['Abstract', 'Color', 'Expressionism'],
    year: '2023',
    dateAdded: Date.now() - 1000
  },
  {
    id: 'initial-2', 
    url: `${BASE_IMAGE_URL}/Collection2.jpeg`,
    title: 'Silent Narratives',
    description: 'A compelling composition that hints at untold stories, using texture and contrast to invite the observer into a deeper dialogue with the artwork.',
    medium: 'Oil on Canvas',
    tags: ['Portrait', 'Realism', 'Atmospheric'],
    year: '2024',
    dateAdded: Date.now() - 2000
  },
  {
    id: 'art-3',
    url: `${BASE_IMAGE_URL}/Collection3.jpeg`,
    title: 'Ephemeral Horizons',
    description: 'Capturing the fleeting moment where earth meets sky, this piece explores the boundaries of perception through light and shadow.',
    medium: 'Acrylic on Panel',
    tags: ['Landscape', 'Contemporary', 'Light'],
    year: '2023',
    dateAdded: Date.now() - 3000
  },
  {
    id: 'art-4',
    url: `${BASE_IMAGE_URL}/Collection4.jpeg`,
    title: 'Urban Rhythms',
    description: 'A chaotic yet structured interpretation of city life, reflecting the energy and pulse of the modern metropolis.',
    medium: 'Digital Illustration',
    tags: ['Urban', 'Modern', 'Digital'],
    year: '2024',
    dateAdded: Date.now() - 4000
  },
  {
    id: 'art-5',
    url: `${BASE_IMAGE_URL}/Collection5.jpeg`,
    title: 'Serene Solitude',
    description: 'A minimalist approach to form and space, evoking a sense of calm and introspection in the viewer.',
    medium: 'Watercolor',
    tags: ['Minimalism', 'Peaceful', 'Watercolor'],
    year: '2022',
    dateAdded: Date.now() - 5000
  },
  {
    id: 'art-6',
    url: `${BASE_IMAGE_URL}/Collection6.jpeg`,
    title: 'Fragments of Memory',
    description: 'Layered textures and fragmented imagery come together to represent the complex and often abstract nature of human memory.',
    medium: 'Collage',
    tags: ['Abstract', 'Collage', 'Memory'],
    year: '2023',
    dateAdded: Date.now() - 6000
  },
  {
    id: 'art-7',
    url: `${BASE_IMAGE_URL}/Collection7.jpeg`,
    title: 'Nature\'s Geometry',
    description: 'Finding the mathematical perfection in organic forms, this piece highlights the hidden patterns found in the natural world.',
    medium: 'Ink on Paper',
    tags: ['Nature', 'Geometry', 'Black & White'],
    year: '2021',
    dateAdded: Date.now() - 7000
  },
  {
    id: 'art-8',
    url: `${BASE_IMAGE_URL}/Collection8.jpeg`,
    title: 'Midnight Reverie',
    description: 'Dark tones and subtle highlights create a dreamlike atmosphere, exploring themes of the subconscious and the night.',
    medium: 'Oil on Canvas',
    tags: ['Surrealism', 'Dark', 'Dream'],
    year: '2024',
    dateAdded: Date.now() - 8000
  },
  {
    id: 'art-9',
    url: `${BASE_IMAGE_URL}/Collection9.jpeg`,
    title: 'Vivid Awakening',
    description: 'A burst of energy and life, utilizing bold strokes and bright colors to signify a new beginning or realization.',
    medium: 'Acrylic',
    tags: ['Vibrant', 'Energy', 'Abstract'],
    year: '2023',
    dateAdded: Date.now() - 9000
  },
  {
    id: 'art-10',
    url: `${BASE_IMAGE_URL}/Collection10.jpeg`,
    title: 'Structural Integrity',
    description: 'An architectural study focusing on lines, angles, and the interplay of light on solid structures.',
    medium: 'Charcoal',
    tags: ['Architecture', 'Structure', 'Drawing'],
    year: '2022',
    dateAdded: Date.now() - 10000
  },
  {
    id: 'art-11',
    url: `${BASE_IMAGE_URL}/Collection11.jpeg`,
    title: 'Fluid Motion',
    description: 'Capturing the essence of movement without a defined form, suggesting the flow of water or wind.',
    medium: 'Alcohol Ink',
    tags: ['Fluid', 'Abstract', 'Motion'],
    year: '2024',
    dateAdded: Date.now() - 11000
  },
  {
    id: 'art-12',
    url: `${BASE_IMAGE_URL}/Collection12.jpeg`,
    title: 'Timeless Gaze',
    description: 'A portrait that looks beyond the present, capturing a universal human expression that transcends time.',
    medium: 'Oil',
    tags: ['Portrait', 'Classic', 'Emotion'],
    year: '2023',
    dateAdded: Date.now() - 12000
  }
];

const App: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Initialize with persisted data or defaults
  useEffect(() => {
    const loadArtworks = async () => {
      setLoadError(null);

      let storedArtworks: Artwork[] = [];
      let readFailed = false;
      try {
        storedArtworks = await getAllArtworksFromStorage();
      } catch (error) {
        // A storage read failure should not leave the gallery blank: fall back
        // to the bundled defaults, but tell the user persistence is degraded.
        console.error("Failed to load artworks from storage:", error);
        readFailed = true;
      }

      const finalArtworks = [...storedArtworks];
      let seedFailed = false;

      // Merge defaults if they are missing
      for (const defaultArt of DEFAULT_ARTWORKS) {
        // Check by ID or roughly by Title/URL if IDs changed in dev
        const exists = finalArtworks.some(art => art.id === defaultArt.id || art.url === defaultArt.url);

        if (!exists) {
          finalArtworks.push(defaultArt);
          // Persist the seed, but a failure here must not prevent the artwork
          // from being displayed.
          try {
            await saveArtworkToStorage(defaultArt);
          } catch (error) {
            console.error(`Failed to persist default artwork "${defaultArt.id}":`, error);
            seedFailed = true;
          }
        } else {
          // Ensure URL is up to date (fix for previous hardcoded vars if needed)
          const existingIndex = finalArtworks.findIndex(art => art.id === defaultArt.id);
          if (existingIndex !== -1 && finalArtworks[existingIndex].url !== defaultArt.url) {
            finalArtworks[existingIndex] = { ...finalArtworks[existingIndex], url: defaultArt.url };
            try {
              await saveArtworkToStorage(finalArtworks[existingIndex]);
            } catch (error) {
              console.error(`Failed to update default artwork "${defaultArt.id}":`, error);
              seedFailed = true;
            }
          }
        }
      }

      // Sort by date added (newest first)
      finalArtworks.sort((a, b) => b.dateAdded - a.dateAdded);
      setArtworks(finalArtworks);

      if (readFailed) {
        setLoadError("Couldn't read your saved collection, so defaults are shown. Changes may not be saved.");
      } else if (seedFailed) {
        setLoadError("Couldn't save some default artworks. They're shown but may not persist.");
      }

      setIsLoading(false);
    };

    loadArtworks();
  }, []);

  const handleUploadComplete = async (newArtwork: Artwork) => {
    // Persist first so the caller can surface a failure; only update the UI
    // once the artwork is safely stored.
    await saveArtworkToStorage(newArtwork);
    setArtworks(prev => [newArtwork, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 relative">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 mb-16 max-w-6xl mx-auto">
             {/* Image Section */}
             <div className="w-full md:w-auto flex justify-center order-1 md:order-1">
               <div className="relative group">
                 <div className="absolute inset-0 bg-stone-200 rounded-lg transform rotate-3 translate-y-2 group-hover:rotate-6 transition-transform"></div>
                 <img 
                   src="https://raw.githubusercontent.com/ashish73p/rartcollections/main/Images/RadhaAward.jpeg" 
                   alt="Radha Award"
                   className="relative w-64 h-auto rounded-lg shadow-xl border-4 border-white object-cover"
                 />
               </div>
             </div>
             
             {/* Text Section */}
             <div className="text-center md:text-left max-w-xl order-2 md:order-2">
                <span className="text-indigo-800 font-bold tracking-wider text-sm uppercase mb-3 inline-block px-4 py-1 rounded-full bg-white shadow-sm border border-indigo-100">The Collection</span>
                <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-6 leading-tight">
                  Radha's Collection
                </h2>
                <p className="text-stone-600 font-light text-lg">
                  Explore a digital gallery where traditional aesthetics meet modern curation. 
                </p>
             </div>
          </div>

          {loadError && (
            <div
              role="alert"
              className="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              {loadError}
            </div>
          )}

          {/* Grid Layout for Horizontal Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {artworks.map((art) => (
              <ArtworkCard 
                key={art.id} 
                artwork={art} 
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

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUploadComplete={handleUploadComplete} 
      />
    </div>
  );
};

export default App;