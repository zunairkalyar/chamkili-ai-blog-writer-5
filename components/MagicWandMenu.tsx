import React from 'react';
import { WandIcon } from './icons/WandIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

export type RewriteInstruction = 'rewrite' | 'shorten' | 'expand' | 'make more professional';

interface MagicWandMenuProps {
  state: {
    visible: boolean;
    top: number;
    left: number;
    selectedText: string;
  };
  onClose: () => void;
  onRewrite: (instruction: RewriteInstruction) => void;
  isRewriting: boolean;
  rewrittenText: string | null;
}

const MagicWandMenu: React.FC<MagicWandMenuProps> = ({ state, onClose, onRewrite, isRewriting, rewrittenText }) => {
  const [copied, setCopied] = React.useState(false);

  if (!state.visible) return null;

  const handleCopy = () => {
    if (!rewrittenText) return;
    navigator.clipboard.writeText(rewrittenText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (isRewriting || rewrittenText) {
    return (
       <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-xl p-6 m-4 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold font-serif text-[#C57F5D] flex items-center gap-3">
                <WandIcon className="w-6 h-6"/> AI Rewrite
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircleIcon className="w-7 h-7"/></button>
           </div>
           <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 border rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Original Text</h3>
                    <p className="text-sm text-gray-700 max-h-60 overflow-y-auto">{state.selectedText}</p>
                </div>
                 <div className="p-4 bg-green-50 border border-green-200 rounded-lg relative">
                    <h3 className="text-sm font-semibold text-green-800 mb-2">Suggested Rewrite</h3>
                    {isRewriting ? (
                        <div className="flex items-center justify-center h-full">
                            <svg className="animate-spin h-6 w-6 text-[#C57F5D]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-green-900 max-h-60 overflow-y-auto">{rewrittenText}</p>
                             <button onClick={handleCopy} className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded-md text-xs text-gray-500 hover:bg-gray-100">
                                {copied ? <CheckIcon className="w-3 h-3 text-green-600"/> : <CopyIcon className="w-3 h-3"/>}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </>
                    )}
                </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute z-30 bg-white rounded-lg shadow-2xl border border-gray-200 flex p-1"
      style={{ top: state.top, left: state.left }}
    >
      <button onClick={() => onRewrite('rewrite')} className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded-md">Rewrite</button>
      <button onClick={() => onRewrite('shorten')} className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded-md">Shorten</button>
      <button onClick={() => onRewrite('expand')} className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded-md">Expand</button>
    </div>
  );
};

export default MagicWandMenu;