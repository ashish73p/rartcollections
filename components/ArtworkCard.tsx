import React, { useState } from 'react';
import { Maximize2, Info } from 'lucide-react';
import { Artwork } from '../types';

interface ArtworkCardProps {
  artwork: Artwork;
  onClick: (artwork: Artwork) => void;
}

const ArtworkCard: React.FC<ArtworkCardProps> = ({ artwork, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <div 
      className="break-inside-avoid mb-6 relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(artwork)}
    >
      <div className={`relative overflow-hidden rounded-lg bg-stone-200 transition-all duration-500 ${!isImageLoaded ? 'min-h-[200px] animate-pulse' : ''}`}>
        <img
          src={artwork.url}
          alt={artwork.title}
          className={`w-full h-auto object-cover transition-transform duration-700 ease-in-out ${isHovered ? 'scale-105' : 'scale-100'} ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsImageLoaded(true)}
        />
        
        {/* Overlay */}
        <div className={`absolute inset-0 bg-stone-900/60 transition-opacity duration-300 flex items-center justify-center gap-4 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 text-center px-4">
            <h3 className="text-stone-50 text-xl font-serif italic mb-1">{artwork.title}</h3>
            <p className="text-stone-300 text-xs uppercase tracking-widest">{artwork.medium}</p>
            <div className="mt-4 inline-flex items-center gap-2 text-stone-200 text-sm border border-stone-400/30 px-3 py-1 rounded-full backdrop-blur-sm">
                <Maximize2 size={14} />
                <span>View Details</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkCard;