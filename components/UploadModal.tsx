import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, Loader2, Sparkles, Image as ImageIcon, Clipboard, AlertCircle } from 'lucide-react';
import { analyzeArtworkImage } from '../services/geminiService';
import { Artwork } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (artwork: Artwork) => void | Promise<void>;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error("Could not read the selected file."));
        }
      };
      reader.onerror = () => reject(reader.error ?? new Error("Failed to read the selected file."));
      reader.onabort = () => reject(new Error("Reading the selected file was aborted."));
      reader.readAsDataURL(file);
    });

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("That file isn't a supported image. Please choose a JPG, PNG, or WebP.");
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      const result = await readFileAsDataUrl(file);
      setPreview(result);

      // Extract base64 data for API
      const base64Data = result.split(',')[1];
      if (!base64Data) {
        throw new Error("The selected image appears to be empty or corrupted.");
      }
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

      await onUploadComplete(newArtwork);
      setIsAnalyzing(false);
      setPreview(null);
      onClose();
    } catch (err) {
      // Reset the analyzing state so the modal never gets stuck, and surface
      // the failure to the user instead of swallowing it.
      console.error("Failed to add artwork:", err);
      setIsAnalyzing(false);
      setError(err instanceof Error ? err.message : "Something went wrong while adding the artwork.");
    }
  }, [onUploadComplete, onClose]);

  // Reset transient state whenever the modal is opened.
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setPreview(null);
      setIsAnalyzing(false);
    }
  }, [isOpen]);

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
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  // Allow re-selecting the same file (e.g. after an error).
                  e.target.value = '';
                  if (file) handleFile(file);
                }} 
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
              <p className="text-stone-400 text-xs mt-4">High resolution JPG, PNG or WebP</p>
            </div>
          )}

          {error && !isAnalyzing && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
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