import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Artwork } from '../types';

interface ArtworkCardProps {
  artwork: Artwork;
  //onClick: (artwork: Artwork) => void;
}

const ArtworkCard: React.FC<ArtworkCardProps> = ({ artwork, onClick }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <div 
      className="group relative flex flex-row bg-white rounded-xl border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden h-64 sm:h-72"
      onClick={() => onClick(artwork)}
    >
      {/* Image Side */}
      <div className="w-2/5 relative bg-stone-200 overflow-hidden">
        <img
          src={artwork.url}
          alt={artwork.title}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsImageLoaded(true)}
        />
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
      </div>

      {/* Content Side */}
      <div className="w-3/5 p-6 sm:p-8 flex flex-col justify-center relative">
        <div className="mb-auto">
            <p className="text-xs font-bold tracking-widest text-indigo-900/60 uppercase mb-2">{artwork.medium}</p>
            <h3 className="text-2xl font-serif text-stone-900 mb-3 leading-tight group-hover:text-indigo-800 transition-colors">{artwork.title}</h3>
            <div className="w-12 h-0.5 bg-stone-200 mb-4 group-hover:w-20 group-hover:bg-indigo-300 transition-all duration-500"></div>
            <p className="text-stone-500 text-sm leading-relaxed line-clamp-3 sm:line-clamp-4 font-light">
            {artwork.description}
            </p>
        </div>

        <div className="mt-4 flex items-center gap-2 text-stone-400 text-xs font-medium group-hover:text-indigo-600 transition-colors">
            <span>View Details</span>
            <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

export default ArtworkCard;