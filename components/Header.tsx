import React from 'react';
import { Palette } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-900 text-stone-50 rounded-full">
                <Palette size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-wider text-stone-900">
                Art<span className="font-light">Collection</span>
              </h1>
              <p className="text-xs text-stone-600 uppercase tracking-widest hidden sm:block">Curated Digital Portfolio</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;