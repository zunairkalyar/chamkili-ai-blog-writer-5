import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { OutlineBlock } from '../services/geminiService';
import { SitemapIcon } from './icons/SitemapIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EditIcon } from './icons/EditIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { PlusIcon } from './icons/PlusIcon';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';


interface OutlineEditorProps {
    outline: OutlineBlock[];
    setOutline: (outline: OutlineBlock[]) => void;
    onApprove: (outline: OutlineBlock[]) => void;
    onCancel: () => void;
    isGenerating: boolean;
    onRegenerateSection: (sectionId: string) => void;
    isRegeneratingSectionId: string | null;
}

const OutlineEditor: React.FC<OutlineEditorProps> = ({ outline, setOutline, onApprove, onCancel, isGenerating, onRegenerateSection, isRegeneratingSectionId }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editCache, setEditCache] = useState<OutlineBlock | null>(null);
    
    const handleEditStart = (section: OutlineBlock) => {
        setEditingId(section.id);
        setEditCache(section);
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditCache(null);
    };

    const handleEditSave = () => {
        if (!editCache) return;
        setOutline(outline.map(s => s.id === editCache.id ? editCache : s));
        setEditingId(null);
        setEditCache(null);
    };

    const handleUpdateCache = (field: 'heading' | 'keyPoints', value: string) => {
        if (!editCache) return;
        setEditCache({ ...editCache, [field]: value });
    };
    
    const handleDelete = (idToDelete: string) => {
        setOutline(outline.filter(s => s.id !== idToDelete));
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= outline.length) return;

        const newOutline = [...outline];
        const temp = newOutline[index];
        newOutline[index] = newOutline[newIndex];
        newOutline[newIndex] = temp;
        setOutline(newOutline);
    };
    
    const handleAddSection = () => {
        const newSection: OutlineBlock = {
            id: uuidv4(),
            heading: 'New Section Title',
            keyPoints: '- New key point'
        };
        setOutline([...outline, newSection]);
        handleEditStart(newSection);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 space-y-6">
            <div className="text-center">
                <SitemapIcon className="w-12 h-12 mx-auto text-[#C57F5D] mb-2" />
                <h2 className="text-2xl font-bold font-serif text-[#3D2C21]">Content Outline</h2>
                <p className="text-gray-500 mt-1">Review, edit, and approve the plan for your article.</p>
            </div>

            <div className="space-y-4">
                {outline.map((item, index) => {
                    const isEditing = editingId === item.id;
                    const isRegenerating = isRegeneratingSectionId === item.id;

                    return (
                        <div key={item.id} className="p-3 bg-gray-50/70 rounded-lg shadow-sm border border-gray-200 transition-all duration-300">
                           {isEditing && editCache ? (
                             <div className="space-y-2">
                                <input 
                                   type="text" 
                                   value={editCache.heading} 
                                   onChange={(e) => handleUpdateCache('heading', e.target.value)}
                                   className="w-full p-2 border border-gray-300 rounded-md font-semibold text-lg text-[#C57F5D] focus:ring-2 focus:ring-[#C57F5D]"
                                />
                                <textarea 
                                   value={editCache.keyPoints} 
                                   onChange={(e) => handleUpdateCache('keyPoints', e.target.value)}
                                   rows={4}
                                   className="w-full p-2 border border-gray-300 rounded-md text-gray-600 prose prose-sm focus:ring-2 focus:ring-[#C57F5D]"
                                />
                                <div className="flex items-center justify-end gap-2">
                                    <button onClick={handleEditCancel} className="p-2 text-gray-500 hover:bg-gray-200 rounded-md"><XCircleIcon className="w-5 h-5"/></button>
                                    <button onClick={handleEditSave} className="p-2 text-green-600 hover:bg-green-100 rounded-md"><CheckIcon className="w-5 h-5"/></button>
                                </div>
                             </div>
                           ) : (
                             <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-[#C57F5D]">{item.heading}</h3>
                                    {isRegenerating ? (
                                        <div className="text-sm text-gray-500 italic mt-1">Regenerating points...</div>
                                    ) : (
                                       <div className="prose prose-sm text-gray-600 mt-1 whitespace-pre-wrap">
                                        {item.keyPoints}
                                       </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-center gap-1 border-l border-gray-200 pl-2">
                                    <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"><ArrowUpIcon className="w-4 h-4" /></button>
                                    <button onClick={() => handleEditStart(item)} disabled={isRegenerating} className="p-1.5 text-gray-500 hover:text-blue-600 disabled:opacity-50"><EditIcon className="w-4 h-4"/></button>
                                    <button onClick={() => onRegenerateSection(item.id)} disabled={isRegenerating} className={`p-1.5 text-gray-500 hover:text-purple-600 disabled:opacity-50 ${isRegenerating ? 'animate-spin' : ''}`}><RefreshIcon className="w-4 h-4"/></button>
                                    <button onClick={() => handleDelete(item.id)} disabled={isRegenerating} className="p-1.5 text-gray-500 hover:text-red-600 disabled:opacity-50"><TrashIcon className="w-4 h-4"/></button>
                                    <button onClick={() => handleMove(index, 'down')} disabled={index === outline.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"><ArrowDownIcon className="w-4 h-4" /></button>
                                </div>
                             </div>
                           )}
                        </div>
                    )
                })}
            </div>
            
            <button onClick={handleAddSection} className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 font-medium py-2 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-colors">
                <PlusIcon className="w-4 h-4" />
                Add Section
            </button>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
                <button 
                    onClick={onCancel}
                    disabled={isGenerating || !!isRegeneratingSectionId}
                    className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-60"
                >
                    Cancel & Start Over
                </button>
                <button 
                    onClick={() => onApprove(outline)}
                    disabled={isGenerating || !!isRegeneratingSectionId || editingId !== null}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <SparkleIcon className="w-5 h-5" />
                    Looks Good, Write Article
                </button>
            </div>
        </div>
    );
};

export default OutlineEditor;