import React from 'react';
import { SeoScore } from '../services/geminiService';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface SeoScoreDisplayProps {
    scoreData: SeoScore | null;
    isLoading: boolean;
    onAnalyze: () => void;
    disabled: boolean;
}

const SeoScoreDisplay: React.FC<SeoScoreDisplayProps> = ({ scoreData, isLoading, onAnalyze, disabled }) => {

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-500">
                Get an on-demand SEO score and recommendations based on your generated content.
            </p>
            <button
                onClick={onAnalyze}
                disabled={isLoading || disabled}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Analyzing...' : 'Analyze SEO'}
            </button>

            {scoreData && (
                 <div className="space-y-4 pt-4 border-t">
                     <div className="text-center">
                        <p className="text-sm text-gray-600">Overall Score</p>
                        <p className={`text-6xl font-bold ${getScoreColor(scoreData.score)}`}>{scoreData.score}</p>
                     </div>
                      <div>
                        <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                           Recommendations
                        </h4>
                        <ul className="space-y-2">
                            {scoreData.recommendations.map((item, index) => (
                                <li key={index} className="flex items-start gap-2 text-xs text-gray-700">
                                    <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5"/>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default SeoScoreDisplay;