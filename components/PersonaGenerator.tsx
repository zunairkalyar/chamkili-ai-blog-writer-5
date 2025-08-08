import React, { useState, useEffect } from 'react';
import { CustomerPersona } from '../services/geminiService';
import { UsersIcon } from './icons/UsersIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface PersonaGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (persona: CustomerPersona) => void;
  currentPersona: CustomerPersona | null;
  generateFunc: (description: string) => Promise<CustomerPersona>;
}

const PersonaGenerator: React.FC<PersonaGeneratorProps> = ({ isOpen, onClose, onSave, currentPersona, generateFunc }) => {
  const [description, setDescription] = useState('Women in Pakistan, aged 18-35, living in urban areas like Karachi or Lahore. They are university students or young professionals, tech-savvy, and follow international beauty trends on Instagram and TikTok. They are looking for effective, scientifically-backed skincare that is also affordable and suitable for a humid climate.');
  const [persona, setPersona] = useState<CustomerPersona | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        setPersona(currentPersona);
        setError(null);
        setIsGenerating(false);
    }
  }, [isOpen, currentPersona]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!description.trim()) {
        setError("Please describe your target audience.");
        return;
    }
    
    setIsGenerating(true);
    setError(null);
    try {
        const generatedPersona = await generateFunc(description);
        setPersona(generatedPersona);
    } catch (err) {
        setError(err instanceof Error ? `Generation failed: ${err.message}` : "Failed to generate persona.");
    } finally {
        setIsGenerating(false);
    }
  };
  
  const handleSave = () => {
    if (persona) {
        onSave(persona);
        onClose();
    }
  };
  
  const generationDisabled = isGenerating || !description.trim();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-8 m-4 max-w-4xl w-full" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
            <div>
                <h2 className="text-2xl font-bold font-serif text-[#C57F5D] flex items-center gap-3">
                    <UsersIcon className="w-7 h-7" />
                    Audience Persona Generator
                </h2>
                <p className="text-gray-600 mt-1">
                    Create a detailed persona to ensure all AI content speaks directly to your ideal customer.
                </p>
            </div>
             <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircleIcon className="w-7 h-7"/></button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Left side: Input */}
            <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 text-lg">1. Describe Your Target Audience</h3>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={8}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C57F5D] text-sm"
                    placeholder="e.g., Young professionals in Karachi, aged 25-35, concerned about sun damage and looking for preventative anti-aging solutions..."
                    disabled={isGenerating}
                />
                <button
                    onClick={handleGenerate}
                    disabled={generationDisabled}
                    className="w-full flex items-center justify-center gap-2 bg-[#D18F70] text-white font-bold py-2.5 px-4 rounded-lg hover:bg-[#C57F5D] disabled:bg-gray-400"
                >
                     {isGenerating ? (
                        <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Generating...</>
                    ) : "Generate Persona"}
                </button>
                 {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            {/* Right side: Output */}
             <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 text-lg">2. Review & Save Persona</h3>
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-lg min-h-[250px] max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {persona ? (
                        <div className="space-y-4">
                           <div className="text-center">
                             <h4 className="text-2xl font-bold font-serif text-amber-900">{persona.name}</h4>
                             <p className="text-sm text-amber-800">{persona.age} | {persona.occupation} | {persona.location}</p>
                             <p className="text-xs italic text-amber-700 mt-1">{persona.personality}</p>
                           </div>
                           <p className="text-sm text-amber-900 bg-white/50 p-3 rounded-md">{persona.bio}</p>
                           <div className="grid grid-cols-2 gap-4 text-sm">
                               <div className="space-y-1">
                                 <h5 className="font-semibold text-amber-800">Goals</h5>
                                 <ul className="list-disc list-inside text-amber-700">
                                     {persona.skincareGoals.map(g => <li key={g}>{g}</li>)}
                                 </ul>
                               </div>
                                <div className="space-y-1">
                                 <h5 className="font-semibold text-amber-800">Pain Points</h5>
                                 <ul className="list-disc list-inside text-amber-700">
                                     {persona.painPoints.map(p => <li key={p}>{p}</li>)}
                                 </ul>
                               </div>
                           </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-center text-amber-700/80">
                            <p>Your generated persona will appear here.</p>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleSave}
                    disabled={!persona}
                    className="w-full bg-green-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                    Save & Use This Persona
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PersonaGenerator;
