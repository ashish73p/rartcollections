import React from 'react';
import { Plus, Palette } from 'lucide-react';

interface HeaderProps {
  onUploadClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onUploadClick }) => {
  return (
    <header className="sticky top-0 z-50 bg-stone-50/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-900 text-stone-50 rounded-full">
                <Palette size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-wider text-stone-900">
                test<span className="font-light">artcollection</span>
              </h1>
              <p className="text-xs text-stone-500 uppercase tracking-widest hidden sm:block">Curated Digital Portfolio</p>
            </div>
          </div>
          
          <button
            onClick={onUploadClick}
            className="group flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-stone-50 text-sm font-medium rounded-full hover:bg-stone-800 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>Add Artwork</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;