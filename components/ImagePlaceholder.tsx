import React from 'react';
import { ImageState } from '../App';
import { DownloadIcon } from './icons/DownloadIcon';
import { EditIcon } from './icons/EditIcon';
import { RefreshIcon } from './icons/RefreshIcon';


interface ImagePlaceholderProps {
    id: string;
    imageState?: ImageState;
    onRetry: (id: string) => void;
    onUpdatePrompt: (id: string, newPrompt: string) => void;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({ id, imageState, onRetry, onUpdatePrompt }) => {

    const handleDownload = () => {
        if (!imageState?.url || !imageState?.prompt) return;
        
        const link = document.createElement('a');
        link.href = imageState.url;

        const sanitizedPrompt = imageState.prompt
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);

        link.download = `chamkili-ai-${sanitizedPrompt || 'generated-image'}.jpeg`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderContent = () => {
        if (!imageState) {
             return <div className="text-sm text-gray-400">Waiting for image prompt...</div>;
        }
        
        const showEditState = imageState.status === 'success' || imageState.status === 'error';

        switch (imageState.status) {
            case 'loading':
                return (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                        <svg className="animate-spin h-8 w-8 text-[#C57F5D]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-2 text-sm font-medium text-gray-600">Generating Image</p>
                        <p className="mt-1 text-xs text-gray-500 italic px-4 line-clamp-2">
                            &quot;{imageState.prompt}&quot;
                        </p>
                    </div>
                );
            case 'success':
                return (
                    <div className="relative group w-full h-full">
                        <img
                            src={imageState.url}
                            alt={imageState.prompt.substring(0, 100)}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                           <div className="text-center text-white">
                             <button
                                onClick={handleDownload}
                                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                                aria-label="Download Image"
                             >
                               <DownloadIcon className="w-6 h-6" />
                             </button>
                             <p className="text-xs font-semibold mt-2">Download Image</p>
                           </div>
                        </div>
                    </div>
                );
            case 'error':
                return (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center text-red-700 p-4 bg-red-50">
                        <p className="font-semibold">Image Generation Failed</p>
                         <p className="mt-1 text-xs text-red-600 italic line-clamp-2 px-4">
                          &quot;{imageState.prompt}&quot;
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="w-full my-6 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="min-h-[200px] flex items-center justify-center relative">
                 {renderContent()}
            </div>
            {imageState && (imageState.status === 'success' || imageState.status === 'error') && (
                <div className="p-3 bg-white border-t border-gray-200">
                    <label htmlFor={`prompt-${id}`} className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5">
                        <EditIcon className="w-4 h-4 text-gray-400" />
                        Image Prompt
                    </label>
                    <div className="flex items-center gap-2">
                         <textarea
                            id={`prompt-${id}`}
                            value={imageState.prompt}
                            onChange={(e) => onUpdatePrompt(id, e.target.value)}
                            rows={3}
                            className="w-full text-sm p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C57F5D] focus:border-[#C57F5D] resize-none transition-shadow duration-200"
                            placeholder="Enter image prompt..."
                        />
                        <button
                            onClick={() => onRetry(id)}
                            className="p-2.5 bg-[#D18F70] text-white rounded-md hover:bg-[#C57F5D] transition-colors self-stretch flex flex-col items-center justify-center"
                            aria-label="Retry image generation"
                        >
                            <RefreshIcon className="w-5 h-5" />
                            <span className="text-xs mt-1">Retry</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};