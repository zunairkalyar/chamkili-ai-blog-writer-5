import React, { useState, useEffect } from 'react';
import { XMarkIcon } from './icons/XMarkIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import type { GeminiSettings } from '../services/geminiService';

const AVAILABLE_MODELS = [
    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash Experimental (Fastest)' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Most Capable)' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Balanced)' },
    { value: 'gemini-pro', label: 'Gemini Pro (Legacy)' },
];

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: GeminiSettings) => void;
    currentSettings: GeminiSettings;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    onSave,
    currentSettings
}) => {
    const [apiKey, setApiKey] = useState('');
    const [model, setModel] = useState('gemini-2.0-flash-exp');
    const [showApiKey, setShowApiKey] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setApiKey(currentSettings.apiKey);
            setModel(currentSettings.model);
        }
    }, [isOpen, currentSettings]);

    const handleSave = () => {
        if (!apiKey.trim()) {
            alert('Please enter a valid API key');
            return;
        }
        
        onSave({
            apiKey: apiKey.trim(),
            model
        });
        onClose();
    };

    const maskApiKey = (key: string) => {
        if (key.length <= 8) return key;
        return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-serif font-bold text-[#C57F5D] flex items-center gap-3">
                            <SettingsIcon className="w-6 h-6" />
                            AI Settings
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Model Selection */}
                        <div>
                            <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-2">
                                Gemini Model
                            </label>
                            <select
                                id="model-select"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C57F5D] focus:border-[#C57F5D] appearance-none bg-white"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                    backgroundPosition: 'right 0.5rem center',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundSize: '1.5em 1.5em'
                                }}
                            >
                                {AVAILABLE_MODELS.map(modelOption => (
                                    <option key={modelOption.value} value={modelOption.value}>
                                        {modelOption.label}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Different models have different capabilities and response times. Flash models are faster but may be less capable.
                            </p>
                        </div>

                        {/* API Key */}
                        <div>
                            <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
                                Google AI API Key
                            </label>
                            <div className="relative">
                                <input
                                    type={showApiKey ? "text" : "password"}
                                    id="api-key"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Enter your Gemini API key"
                                    className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C57F5D] focus:border-[#C57F5D]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
                                >
                                    {showApiKey ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            {!showApiKey && apiKey && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Current: {maskApiKey(apiKey)}
                                </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Get your free API key from{' '}
                                <a 
                                    href="https://aistudio.google.com/app/apikey" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[#C57F5D] hover:underline"
                                >
                                    Google AI Studio
                                </a>
                            </p>
                        </div>

                        {/* Model Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-800 mb-2">Model Information</h4>
                            {model === 'gemini-2.0-flash-exp' && (
                                <div className="text-sm text-gray-600">
                                    <p className="mb-1"><strong>Speed:</strong> Very Fast</p>
                                    <p className="mb-1"><strong>Quality:</strong> High</p>
                                    <p className="mb-1"><strong>Best for:</strong> Most content generation tasks</p>
                                    <p className="text-amber-600"><strong>Note:</strong> Experimental model, may be unstable</p>
                                </div>
                            )}
                            {model === 'gemini-1.5-pro' && (
                                <div className="text-sm text-gray-600">
                                    <p className="mb-1"><strong>Speed:</strong> Slower</p>
                                    <p className="mb-1"><strong>Quality:</strong> Highest</p>
                                    <p className="mb-1"><strong>Best for:</strong> Complex tasks, detailed analysis</p>
                                    <p className="text-green-600"><strong>Status:</strong> Stable</p>
                                </div>
                            )}
                            {model === 'gemini-1.5-flash' && (
                                <div className="text-sm text-gray-600">
                                    <p className="mb-1"><strong>Speed:</strong> Fast</p>
                                    <p className="mb-1"><strong>Quality:</strong> High</p>
                                    <p className="mb-1"><strong>Best for:</strong> Balanced performance</p>
                                    <p className="text-green-600"><strong>Status:</strong> Stable</p>
                                </div>
                            )}
                            {model === 'gemini-pro' && (
                                <div className="text-sm text-gray-600">
                                    <p className="mb-1"><strong>Speed:</strong> Medium</p>
                                    <p className="mb-1"><strong>Quality:</strong> Good</p>
                                    <p className="mb-1"><strong>Best for:</strong> General tasks</p>
                                    <p className="text-yellow-600"><strong>Status:</strong> Legacy (consider upgrading)</p>
                                </div>
                            )}
                        </div>

                        {/* Warning about overload */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="font-semibold text-red-800 mb-2">Overload Issues?</h4>
                            <p className="text-sm text-red-600 mb-2">
                                If you're experiencing "model overloaded" errors:
                            </p>
                            <ul className="text-sm text-red-600 space-y-1 list-disc ml-4">
                                <li>Switch to Gemini 1.5 Pro (more stable)</li>
                                <li>Try again after a few minutes</li>
                                <li>Use your own API key for better reliability</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 px-4 py-2 bg-[#D18F70] text-white rounded-lg hover:bg-[#C57F5D] transition-colors font-semibold"
                        >
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
