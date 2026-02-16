import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ArtworkCard from './components/ArtworkCard';
import UploadModal from './components/UploadModal';
import ImageViewer from './components/ImageViewer';
import { Artwork } from './types';

// Hardcoded initial image as requested
const INITIAL_IMAGE_URL = "https://photos.fife.usercontent.google.com/pw/AP1GczP4fEP4JjW529eU8JjdFpqF8vpAV9ci9q8dxo3hwd1ZKFAZNGIAZ4w8eg=w1379-h1035-s-no?authuser=0";

const App: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  // Initialize with the requested image
  useEffect(() => {
    // Check if we already have it in state to avoid dupes on re-renders if logic changes, 
    // but for simple mount effect:
    const initialArtwork: Artwork = {
      id: 'initial-1',
      url: INITIAL_IMAGE_URL,
      title: 'Provenance #1',
      description: 'The cornerstone of the collection. A study in texture and form that serves as the foundation for this digital archive.',
      medium: 'Mixed Media on Canvas',
      tags: ['Abstract', 'Contemporary', 'Featured'],
      year: '2024',
      dateAdded: Date.now()
    };
    setArtworks([initialArtwork]);
  }, []);

  const handleUploadComplete = (newArtwork: Artwork) => {
    setArtworks(prev => [newArtwork, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onUploadClick={() => setIsUploadModalOpen(true)} />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <span className="text-indigo-600 font-semibold tracking-wider text-sm uppercase mb-2 block">The Collection</span>
          <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-6">
            Curated Expressions
          </h2>
          <p className="max-w-2xl mx-auto text-stone-500 font-light text-lg">
            Explore a digital gallery where traditional aesthetics meet modern curation. 
            Upload your own pieces to have them analyzed and cataloged by our AI curator.
          </p>
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

        {artworks.length === 0 && (
           <div className="text-center py-20 bg-stone-100 rounded-xl border border-dashed border-stone-300">
              <p className="text-stone-400">Loading collection...</p>
           </div>
        )}
      </main>

      <footer className="bg-stone-900 text-stone-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-serif text-lg text-stone-200 mb-2">test<span className="font-light">artcollection</span></p>
          <p className="text-sm opacity-60">&copy; {new Date().getFullYear()} Digital Art Portfolio. All rights reserved.</p>
        </div>
      </footer>

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUploadComplete={handleUploadComplete} 
      />

      <ImageViewer 
        artwork={selectedArtwork} 
        onClose={() => setSelectedArtwork(null)} 
      />
    </div>
  );
};

export default App;