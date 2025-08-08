import React from 'react';
import { TrendingTopicResult } from '../services/geminiService';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { SparkleIcon } from './icons/SparkleIcon';

interface TrendSpotterProps {
    onFetch: () => void;
    isLoading: boolean;
    error: string | null;
    result: TrendingTopicResult | null;
    onUseTopic: (topic: string) => void;
}

const TrendSpotter: React.FC<TrendSpotterProps> = ({ onFetch, isLoading, error, result, onUseTopic }) => {
    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-500">
                Discover what's currently trending in the Pakistani skincare market to inspire your next blog post.
            </p>
            <button
                onClick={onFetch}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
            >
                {isLoading ? 'Discovering...' : 'Discover Trends'}
            </button>
            
            {isLoading && (
                 <div className="text-center py-4">
                    <svg className="animate-spin h-6 w-6 text-purple-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 </div>
            )}
            
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}

            {result && (
                <div className="space-y-3 pt-4 border-t">
                    {result.topics.map((trend, index) => (
                        <div key={index} className="p-3 bg-gray-50/70 rounded-lg border border-gray-200">
                            <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                                <LightbulbIcon className="w-5 h-5 text-yellow-400"/>
                                {trend.topic}
                            </h5>
                            <p className="text-xs text-gray-600 italic my-1">{trend.reason}</p>
                            <button 
                                onClick={() => onUseTopic(trend.topic)}
                                className="text-xs font-bold text-white bg-[#C57F5D] hover:bg-[#b56f4c] px-2 py-1 rounded-md flex items-center gap-1.5 transition-colors"
                            >
                                <SparkleIcon className="w-3 h-3" />
                                Use this Topic
                            </button>
                        </div>
                    ))}
                    {result.sources.length > 0 && (
                        <div className="pt-2">
                             <h6 className="text-xs font-semibold text-gray-500">Sources:</h6>
                             <ul className="list-disc list-inside text-xs mt-1">
                                {result.sources.map((source, i) => (
                                    <li key={i} className="truncate">
                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" title={source.uri}>
                                            {source.title || source.uri}
                                        </a>
                                    </li>
                                ))}
                             </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TrendSpotter;
