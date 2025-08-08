import React, { useState, useMemo } from 'react';
import { ImageState } from '../App';
import { ImagePlaceholder } from './ImagePlaceholder';
import { convertBlocksToHtml, convertBlocksToMarkdown } from '../utils/contentUtils';

import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { MarkdownIcon } from './icons/MarkdownIcon';
import { WandIcon } from './icons/WandIcon';

export interface ContentBlock {
  id: string;
  type: 'html' | 'image';
  data: any;
}

interface BlogPostDisplayProps {
  blocks: ContentBlock[];
  imageStates: Record<string, ImageState>;
  isLoading: boolean;
  onRetryImage: (id: string) => void;
  onUpdateImagePrompt: (id: string, newPrompt: string) => void;
}

export const BlogPostDisplay: React.FC<BlogPostDisplayProps> = ({ blocks, imageStates, isLoading, onRetryImage, onUpdateImagePrompt }) => {
  const [copiedType, setCopiedType] = useState<'html' | 'markdown' | null>(null);
  const hasContent = blocks.length > 0;

  const handleCopy = (type: 'html' | 'markdown') => {
    if (!hasContent || !navigator.clipboard) return;
    
    let contentToCopy = '';
    if (type === 'html') {
      contentToCopy = convertBlocksToHtml(blocks, imageStates);
    } else {
      contentToCopy = convertBlocksToMarkdown(blocks, imageStates);
    }

    navigator.clipboard.writeText(contentToCopy).then(() => {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    }).catch(err => {
      console.error(`Failed to copy ${type}: `, err);
      alert(`Failed to copy ${type}.`);
    });
  };

  const MemoizedContent = useMemo(() => {
    return blocks.map(block => {
        if (block.type === 'html') {
          return <div key={block.id} dangerouslySetInnerHTML={{ __html: block.data.html }} />;
        }
        if (block.type === 'image') {
          return (
            <ImagePlaceholder
              key={block.id}
              id={block.id}
              imageState={imageStates[block.id]}
              onRetry={onRetryImage}
              onUpdatePrompt={onUpdateImagePrompt}
            />
          );
        }
        return null;
      });
  }, [blocks, imageStates, onRetryImage, onUpdateImagePrompt]);


  return (
    <div className="relative p-6 md:p-10 min-h-[400px]">
      {hasContent && !isLoading && (
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={() => handleCopy('html')}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-[#C57F5D] transition-all disabled:opacity-60"
              aria-label="Copy blog post HTML"
              disabled={copiedType === 'html'}
            >
              {copiedType === 'html' ? <CheckIcon className="w-4 h-4 text-green-600" /> : <CopyIcon className="w-4 h-4" />}
              <span>{copiedType === 'html' ? 'Copied!' : 'Copy HTML'}</span>
            </button>
             <button
              onClick={() => handleCopy('markdown')}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-[#C57F5D] transition-all disabled:opacity-60"
              aria-label="Copy blog post as Markdown"
              disabled={copiedType === 'markdown'}
            >
              {copiedType === 'markdown' ? <CheckIcon className="w-4 h-4 text-green-600" /> : <MarkdownIcon className="w-4 h-4" />}
              <span>{copiedType === 'markdown' ? 'Copied!' : 'Markdown'}</span>
            </button>
        </div>
      )}
      
      {isLoading && blocks.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
                <div className="w-16 h-16 border-4 border-[#D18F70] border-dashed rounded-full animate-spin mx-auto mb-4"></div>
                <p className="font-medium">Generating your beautiful blog post...</p>
                <p className="text-sm">Crafting text and generating images. This may take a moment.</p>
            </div>
        </div>
      ) : hasContent ? (
        <div className="prose prose-lg max-w-none prose-h1:text-[#C57F5D] prose-h2:text-[#3D2C21] prose-p:text-gray-600 prose-ul:text-gray-600 pt-8">
          {MemoizedContent}
           <div className="absolute -bottom-4 right-4 text-xs text-gray-400/80 italic flex items-center gap-1.5">
              <WandIcon className="w-3 h-3"/> Highlight text to edit with AI
            </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-center text-gray-400">
          <div>
            <p className="font-medium text-lg">Your generated post will appear here.</p>
            <p className="text-sm">Start by entering a title and clicking generate.</p>
          </div>
        </div>
      )}
    </div>
  );
};