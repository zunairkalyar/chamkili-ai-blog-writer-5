import React, { useState } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { RepeatIcon } from './icons/RepeatIcon';
import { RepurposePlatform } from '../App';
import { InstagramIcon } from './icons/InstagramIcon';
import { MailIcon } from './icons/MailIcon';

interface RepurposePanelProps {
    onRepurpose: (platform: RepurposePlatform) => void;
    isRepurposing: boolean;
    result: { platform: string; content: string } | null;
    onClear: () => void;
}

const RepurposePanel: React.FC<RepurposePanelProps> = ({ onRepurpose, isRepurposing, result, onClear }) => {
    const [isCopied, setIsCopied] = useState(false);
    
    const handleCopy = () => {
        if (!result?.content) return;
        navigator.clipboard.writeText(result.content).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
        });
    };

    const isLoadingFor = (platform: RepurposePlatform) => isRepurposing && (!result || result.platform !== platform);

    return (
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-serif font-bold text-[#C57F5D] mb-4 flex items-center gap-3">
                <RepeatIcon className="w-6 h-6" /> Repurpose Content
            </h3>
            <p className="text-sm text-gray-600 mb-4">
                Turn this article into content for other platforms with one click.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button 
                    onClick={() => onRepurpose('twitter')} 
                    disabled={isRepurposing}
                    className="flex items-center justify-center gap-2 text-center py-2 px-3 border border-[#1DA1F2] text-[#1DA1F2] font-semibold rounded-lg hover:bg-[#1DA1F2] hover:text-white transition-colors disabled:opacity-50"
                >
                    {isLoadingFor('twitter') ? '...' : <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>}
                    <span>Twitter</span>
                </button>
                <button 
                    onClick={() => onRepurpose('linkedin')}
                    disabled={isRepurposing}
                    className="flex items-center justify-center gap-2 text-center py-2 px-3 border border-[#0A66C2] text-[#0A66C2] font-semibold rounded-lg hover:bg-[#0A66C2] hover:text-white transition-colors disabled:opacity-50"
                >
                    {isLoadingFor('linkedin') ? '...' : <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.25 6.5 1.75 1.75 0 016.5 8.25zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93-.94 0-1.62.68-1.62 1.93V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.42c2.28 0 3.1 1.7 3.1 3.98z"></path></svg>}
                    <span>LinkedIn</span>
                </button>
                 <button 
                    onClick={() => onRepurpose('instagram')}
                    disabled={isRepurposing}
                    className="flex items-center justify-center gap-2 text-center py-2 px-3 border border-[#E1306C] text-[#E1306C] font-semibold rounded-lg hover:bg-[#E1306C] hover:text-white transition-colors disabled:opacity-50"
                >
                    {isLoadingFor('instagram') ? '...' : <InstagramIcon className="w-5 h-5" />}
                    <span>Instagram</span>
                </button>
                 <button 
                    onClick={() => onRepurpose('email')}
                    disabled={isRepurposing}
                    className="flex items-center justify-center gap-2 text-center py-2 px-3 border border-[#6b7280] text-[#6b7280] font-semibold rounded-lg hover:bg-[#6b7280] hover:text-white transition-colors disabled:opacity-50"
                >
                    {isLoadingFor('email') ? '...' : <MailIcon className="w-5 h-5" />}
                    <span>Email</span>
                </button>
            </div>

            {(isRepurposing || result) && (
                <div className="mt-6">
                    {isRepurposing ? (
                         <div className="w-full h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                            <svg className="animate-spin h-6 w-6 text-[#C57F5D]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                         </div>
                    ) : result && (
                        <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200">
                           <div className="flex justify-between items-center mb-2">
                             <h4 className="font-semibold text-gray-700 capitalize">{result.platform} Post</h4>
                             <button
                                onClick={handleCopy}
                                className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded-md text-xs text-gray-500 hover:bg-gray-100"
                             >
                                 {isCopied ? <CheckIcon className="w-3 h-3 text-green-600" /> : <CopyIcon className="w-3 h-3" />}
                                 {isCopied ? 'Copied!' : 'Copy'}
                             </button>
                           </div>
                           <textarea
                                readOnly
                                value={result.content}
                                rows={10}
                                className="w-full bg-white p-2 rounded-md border border-gray-200 text-sm whitespace-pre-wrap"
                           />
                           <button onClick={onClear} className="text-xs text-gray-500 hover:underline mt-2">Clear</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RepurposePanel;