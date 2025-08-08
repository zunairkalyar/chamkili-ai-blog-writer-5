import React, { useState, useEffect } from 'react';
import { XCircleIcon } from './icons/XCircleIcon';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';

interface BrandVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: string) => void;
  currentProfile: string | null;
  analyzeFunc: (text: string) => Promise<string>;
  analyzeUrlFunc: (url: string) => Promise<string>;
}

type AnalysisType = 'text' | 'url';

const BrandVoiceModal: React.FC<BrandVoiceModalProps> = ({ isOpen, onClose, onSave, currentProfile, analyzeFunc, analyzeUrlFunc }) => {
  const [analysisType, setAnalysisType] = useState<AnalysisType>('text');
  const [inputText, setInputText] = useState('');
  const [url, setUrl] = useState('');
  const [analyzedProfile, setAnalyzedProfile] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        setInputText('');
        setUrl('');
        setAnalyzedProfile(currentProfile || '');
        setError(null);
        setIsAnalyzing(false);
        setAnalysisType('text');
    }
  }, [isOpen, currentProfile]);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (analysisType === 'text' && !inputText.trim()) {
        setError("Please paste some text to analyze.");
        return;
    }
    if (analysisType === 'url' && !url.trim()) {
        setError("Please enter a URL to analyze.");
        return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    try {
        const profile = analysisType === 'text' 
            ? await analyzeFunc(inputText)
            : await analyzeUrlFunc(url);
        setAnalyzedProfile(profile);
    } catch (err) {
        setError(err instanceof Error ? `Analysis failed: ${err.message}` : "Failed to analyze.");
    } finally {
        setIsAnalyzing(false);
    }
  };
  
  const handleSave = () => {
    onSave(analyzedProfile);
    onClose();
  };
  
  const analysisButtonDisabled = isAnalyzing || (analysisType === 'text' && !inputText.trim()) || (analysisType === 'url' && !url.trim());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-8 m-4 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
            <div>
                <h2 className="text-2xl font-bold font-serif text-[#C57F5D] flex items-center gap-3">
                    <BrainCircuitIcon className="w-7 h-7" />
                    Brand Voice Profile
                </h2>
                <p className="text-gray-600 mt-1">
                    Teach the AI your unique brand voice for perfectly on-brand content.
                </p>
            </div>
             <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircleIcon className="w-7 h-7"/></button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Left side: Input */}
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">1. Provide a Sample</h3>
                 <div className="flex border-b border-gray-200">
                    <button onClick={() => setAnalysisType('text')} className={`px-4 py-2 text-sm font-medium ${analysisType === 'text' ? 'border-b-2 border-[#C57F5D] text-[#C57F5D]' : 'text-gray-500 hover:bg-gray-100'}`}>From Text</button>
                    <button onClick={() => setAnalysisType('url')} className={`px-4 py-2 text-sm font-medium ${analysisType === 'url' ? 'border-b-2 border-[#C57F5D] text-[#C57F5D]' : 'text-gray-500 hover:bg-gray-100'}`}>From URL</button>
                </div>
                
                {analysisType === 'text' ? (
                     <div className="space-y-2 pt-2">
                        <p className="text-sm text-gray-500">Paste in 100-500 words of your best marketing copy, blog posts, or "About Us" page text.</p>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            rows={10}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C57F5D] text-sm"
                            placeholder="Paste your sample text here..."
                            disabled={isAnalyzing}
                        />
                     </div>
                ) : (
                    <div className="space-y-2 pt-2">
                        <p className="text-sm text-gray-500">Enter your homepage or blog URL. The AI will analyze the content to find your brand's voice.</p>
                         <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C57F5D] text-sm"
                            placeholder="https://yourbrand.com"
                            disabled={isAnalyzing}
                        />
                        <p className="text-xs text-gray-400">Note: Analysis may not work for all sites, especially those with heavy client-side rendering or bot protection.</p>
                    </div>
                )}
               
                <button
                    onClick={handleAnalyze}
                    disabled={analysisButtonDisabled}
                    className="w-full flex items-center justify-center gap-2 bg-[#D18F70] text-white font-bold py-2.5 px-4 rounded-lg hover:bg-[#C57F5D] disabled:bg-gray-400"
                >
                     {isAnalyzing ? (
                        <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Analyzing...</>
                    ) : "Analyze Voice"}
                </button>
            </div>

            {/* Right side: Output */}
             <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">2. Review & Save Profile</h3>
                <p className="text-sm text-gray-500">This profile will guide the AI's writing style. You can edit it before saving.</p>
                <textarea
                    value={analyzedProfile}
                    onChange={(e) => setAnalyzedProfile(e.target.value)}
                    rows={10}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-green-50/50 text-sm"
                    placeholder="Your brand voice profile will appear here..."
                />
                <button
                    onClick={handleSave}
                    disabled={!analyzedProfile.trim()}
                    className="w-full bg-green-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                    Save & Use This Profile
                </button>
            </div>
        </div>
        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default BrandVoiceModal;