import React from 'react';
import { X, Calendar, Tag, PenTool } from 'lucide-react';
import { Artwork } from '../types';

interface ImageViewerProps {
  artwork: Artwork | null;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ artwork, onClose }) => {
  if (!artwork) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
      <div 
        className="absolute inset-0 bg-stone-900/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-6xl rounded-none sm:rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm"
        >
          <X size={24} />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-2/3 bg-stone-100 flex items-center justify-center relative group">
           {/* Pattern background for transparency/empty space */}
           <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
           
           <img 
            src={artwork.url} 
            alt={artwork.title} 
            className="max-h-[50vh] md:max-h-full max-w-full object-contain shadow-xl z-0"
           />
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/3 bg-white p-8 flex flex-col overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-3xl font-serif text-stone-900 mb-2">{artwork.title}</h2>
            <div className="w-12 h-1 bg-indigo-500 mb-4"></div>
            <p className="text-stone-600 leading-relaxed font-light">
              {artwork.description}
            </p>
          </div>

          <div className="space-y-6 mt-auto">
             <div className="flex items-center gap-3 text-stone-700">
                <PenTool size={18} className="text-stone-400" />
                <span className="font-medium">{artwork.medium}</span>
             </div>
             
             {artwork.year && (
                <div className="flex items-center gap-3 text-stone-700">
                    <Calendar size={18} className="text-stone-400" />
                    <span>{artwork.year}</span>
                </div>
             )}

             <div className="pt-6 border-t border-stone-100">
                <h4 className="text-xs uppercase tracking-widest text-stone-400 mb-3 flex items-center gap-2">
                    <Tag size={12} />
                    Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                    {artwork.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-stone-100 text-stone-600 text-xs rounded-full hover:bg-stone-200 transition-colors cursor-default">
                            #{tag}
                        </span>
                    ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;