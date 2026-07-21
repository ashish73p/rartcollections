import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, Loader2, Sparkles, Image as ImageIcon, Clipboard } from 'lucide-react';
import { analyzeArtworkImage } from '../services/geminiService';
import { Artwork } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (artwork: Artwork) => void;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError('Unsupported file type. Please upload a JPG, PNG, WebP or GIF image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Image is too large. Maximum allowed size is 10 MB.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      setIsAnalyzing(true);

      // Extract base64 data for API
      const base64Data = result.split(',')[1];
      const mimeType = file.type;

      // Analyze with Gemini
      const analysis = await analyzeArtworkImage(base64Data, mimeType);

      const newArtwork: Artwork = {
        id: crypto.randomUUID(),
        url: result,
        title: analysis.title,
        description: analysis.description,
        medium: analysis.medium,
        tags: analysis.tags,
        dateAdded: Date.now()
      };

      onUploadComplete(newArtwork);
      setIsAnalyzing(false);
      setPreview(null);
      onClose();
    };
    reader.readAsDataURL(file);
  }, [onUploadComplete, onClose]);

  // Handle paste events (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isOpen || isAnalyzing) return;
      
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            handleFile(blob);
            break; // Only take the first image
          }
        }
      }
    };

    // Attach to document so it works anywhere when modal is open
    if (isOpen) {
      document.addEventListener('paste', handlePaste);
    }
    
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [isOpen, isAnalyzing, handleFile]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
        onClick={!isAnalyzing ? onClose : undefined}
      ></div>
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <h2 className="text-xl font-serif text-stone-800 flex items-center gap-2">
            <Upload size={20} />
            Add to Collection
          </h2>
          {!isAnalyzing && (
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-8">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in duration-300">
              <div className="relative mb-6">
                 {preview && (
                    <img src={preview} alt="Analyzing" className="w-32 h-32 object-cover rounded-lg shadow-md opacity-50" />
                 )}
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/80 p-3 rounded-full shadow-lg backdrop-blur">
                        <Loader2 className="animate-spin text-indigo-600" size={32} />
                    </div>
                 </div>
              </div>
              <h3 className="text-lg font-medium text-stone-800 mb-2 flex items-center justify-center gap-2">
                <Sparkles size={18} className="text-indigo-500" />
                Curating & Analyzing
              </h3>
              <p className="text-stone-500 max-w-xs mx-auto text-sm">
                Our AI curator is examining the artwork to determine medium, style, and generate a title...
              </p>
            </div>
          ) : (
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 relative group
                ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-stone-300 hover:border-stone-400 hover:bg-stone-50'}
              `}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => e.target.files && handleFile(e.target.files[0])} 
                className="hidden" 
                accept="image/*"
              />
              
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400 group-hover:text-stone-600 transition-colors">
                <ImageIcon size={32} />
              </div>
              
              <p className="text-stone-700 font-medium mb-1">Click to upload, drag & drop</p>
              <div className="flex items-center justify-center gap-2 text-stone-400 text-sm mt-2">
                 <Clipboard size={14} />
                 <span>or paste image (Ctrl+V)</span>
              </div>
              <p className="text-stone-400 text-xs mt-4">JPG, PNG, WebP or GIF · max 10 MB</p>
            </div>
          )}

          {error && !isAnalyzing && (
            <p className="mt-4 text-sm text-red-600 text-center" role="alert">{error}</p>
          )}
        </div>
        
        {!isAnalyzing && (
            <div className="p-4 bg-stone-50 border-t border-stone-100 text-center">
                 <p className="text-xs text-stone-400 flex items-center justify-center gap-1">
                    <Sparkles size={12} />
                    Powered by Gemini Vision for automatic curation
                 </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default UploadModal;