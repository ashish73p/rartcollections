import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ArtworkCard from './components/ArtworkCard';
import ImageViewer from './components/ImageViewer';
import UploadModal from './components/UploadModal';
import { Artwork } from './types';
import { getAllArtworksFromStorage, saveArtworkToStorage } from './services/storageService';
import { imageUrl } from './constants';
import { sortArtworksByNewest } from './utils';

// Extended collection of default artworks
const DEFAULT_ARTWORKS: Artwork[] = [
  {
    id: 'initial-1', 
    url: imageUrl('Collection1.jpg'),
    title: 'Chromatic Resonance',
    description: 'An immersive study of color dynamics, where vibrant hues interact to create a visual symphony that resonates with the viewer\'s emotions.',
    medium: 'Mixed Media on Canvas',
    tags: ['Abstract', 'Color', 'Expressionism'],
    year: '2023',
    dateAdded: Date.now() - 1000
  },
  {
    id: 'initial-2', 
    url: imageUrl('Collection2.jpeg'),
    title: 'Silent Narratives',
    description: 'A compelling composition that hints at untold stories, using texture and contrast to invite the observer into a deeper dialogue with the artwork.',
    medium: 'Oil on Canvas',
    tags: ['Portrait', 'Realism', 'Atmospheric'],
    year: '2024',
    dateAdded: Date.now() - 2000
  },
  {
    id: 'art-3',
    url: imageUrl('Collection3.jpeg'),
    title: 'Ephemeral Horizons',
    description: 'Capturing the fleeting moment where earth meets sky, this piece explores the boundaries of perception through light and shadow.',
    medium: 'Acrylic on Panel',
    tags: ['Landscape', 'Contemporary', 'Light'],
    year: '2023',
    dateAdded: Date.now() - 3000
  },
  {
    id: 'art-4',
    url: imageUrl('Collection4.jpeg'),
    title: 'Urban Rhythms',
    description: 'A chaotic yet structured interpretation of city life, reflecting the energy and pulse of the modern metropolis.',
    medium: 'Digital Illustration',
    tags: ['Urban', 'Modern', 'Digital'],
    year: '2024',
    dateAdded: Date.now() - 4000
  },
  {
    id: 'art-5',
    url: imageUrl('Collection5.jpeg'),
    title: 'Serene Solitude',
    description: 'A minimalist approach to form and space, evoking a sense of calm and introspection in the viewer.',
    medium: 'Watercolor',
    tags: ['Minimalism', 'Peaceful', 'Watercolor'],
    year: '2022',
    dateAdded: Date.now() - 5000
  },
  {
    id: 'art-6',
    url: imageUrl('Collection6.jpeg'),
    title: 'Fragments of Memory',
    description: 'Layered textures and fragmented imagery come together to represent the complex and often abstract nature of human memory.',
    medium: 'Collage',
    tags: ['Abstract', 'Collage', 'Memory'],
    year: '2023',
    dateAdded: Date.now() - 6000
  },
  {
    id: 'art-7',
    url: imageUrl('Collection7.jpeg'),
    title: 'Nature\'s Geometry',
    description: 'Finding the mathematical perfection in organic forms, this piece highlights the hidden patterns found in the natural world.',
    medium: 'Ink on Paper',
    tags: ['Nature', 'Geometry', 'Black & White'],
    year: '2021',
    dateAdded: Date.now() - 7000
  },
  {
    id: 'art-8',
    url: imageUrl('Collection8.jpeg'),
    title: 'Midnight Reverie',
    description: 'Dark tones and subtle highlights create a dreamlike atmosphere, exploring themes of the subconscious and the night.',
    medium: 'Oil on Canvas',
    tags: ['Surrealism', 'Dark', 'Dream'],
    year: '2024',
    dateAdded: Date.now() - 8000
  },
  {
    id: 'art-9',
    url: imageUrl('Collection9.jpeg'),
    title: 'Vivid Awakening',
    description: 'A burst of energy and life, utilizing bold strokes and bright colors to signify a new beginning or realization.',
    medium: 'Acrylic',
    tags: ['Vibrant', 'Energy', 'Abstract'],
    year: '2023',
    dateAdded: Date.now() - 9000
  },
  {
    id: 'art-10',
    url: imageUrl('Collection10.jpeg'),
    title: 'Structural Integrity',
    description: 'An architectural study focusing on lines, angles, and the interplay of light on solid structures.',
    medium: 'Charcoal',
    tags: ['Architecture', 'Structure', 'Drawing'],
    year: '2022',
    dateAdded: Date.now() - 10000
  },
  {
    id: 'art-11',
    url: imageUrl('Collection11.jpeg'),
    title: 'Fluid Motion',
    description: 'Capturing the essence of movement without a defined form, suggesting the flow of water or wind.',
    medium: 'Alcohol Ink',
    tags: ['Fluid', 'Abstract', 'Motion'],
    year: '2024',
    dateAdded: Date.now() - 11000
  },
  {
    id: 'art-12',
    url: imageUrl('Collection12.jpeg'),
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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Initialize with persisted data or defaults
  useEffect(() => {
    const loadArtworks = async () => {
      try {
        const storedArtworks = await getAllArtworksFromStorage();
        let finalArtworks = [...storedArtworks];
        
        // Merge defaults if they are missing
        for (const defaultArt of DEFAULT_ARTWORKS) {
            // Check by ID or roughly by Title/URL if IDs changed in dev
            const exists = finalArtworks.some(art => art.id === defaultArt.id || art.url === defaultArt.url);
            
            if (!exists) {
                finalArtworks.push(defaultArt);
                // Save asynchronously to DB
                await saveArtworkToStorage(defaultArt);
            } else {
              // Ensure URL is up to date (fix for previous hardcoded vars if needed)
              const existingIndex = finalArtworks.findIndex(art => art.id === defaultArt.id);
              if (existingIndex !== -1 && finalArtworks[existingIndex].url !== defaultArt.url) {
                finalArtworks[existingIndex] = { ...finalArtworks[existingIndex], url: defaultArt.url };
                await saveArtworkToStorage(finalArtworks[existingIndex]);
              }
            }
        }

        // Sort by date added (newest first)
        setArtworks(sortArtworksByNewest(finalArtworks));

      } catch (error) {
        console.error("Failed to load artworks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadArtworks();
  }, []);

  const handleUploadComplete = async (newArtwork: Artwork) => {
    try {
      await saveArtworkToStorage(newArtwork);
      setArtworks(prev => [newArtwork, ...prev]);
    } catch (error) {
      console.error("Failed to save uploaded artwork:", error);
    }
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
                   src={imageUrl('RadhaAward.jpeg')} 
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