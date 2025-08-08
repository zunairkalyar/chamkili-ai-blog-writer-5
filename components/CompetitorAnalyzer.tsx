import React from 'react';
import { CompetitorAnalysis } from '../services/geminiService';
import { SparkleIcon } from './icons/SparkleIcon';
import { ThumbsDownIcon } from './icons/ThumbsDownIcon';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { SitemapIcon } from './icons/SitemapIcon';

interface CompetitorAnalyzerProps {
    url: string;
    setUrl: (url: string) => void;
    analysis: CompetitorAnalysis | null;
    isLoading: boolean;
    error: string | null;
    onAnalyze: () => void;
}

const CompetitorAnalyzer: React.FC<CompetitorAnalyzerProps> = ({
    url,
    setUrl,
    analysis,
    isLoading,
    error,
    onAnalyze
}) => {
    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="competitorUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Competitor Article URL
                </label>
                <input
                    type="url"
                    id="competitorUrl"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://competitor.com/blog/post"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    disabled={isLoading}
                />
            </div>
            <button
                onClick={onAnalyze}
                disabled={isLoading || !url.trim()}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
                {isLoading ? 'Analyzing...' : 'Analyze & Get Brief'}
            </button>
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
            {analysis && (
                <div className="space-y-4 pt-4 border-t">
                    <AnalysisSection title="Strengths" icon={<ThumbsUpIcon className="w-5 h-5 text-green-500"/>} items={analysis.strengths} />
                    <AnalysisSection title="Weaknesses" icon={<ThumbsDownIcon className="w-5 h-5 text-red-500"/>} items={analysis.weaknesses} />
                    <AnalysisSection title="Content Gaps" icon={<LightbulbIcon className="w-5 h-5 text-yellow-500"/>} items={analysis.contentGapOpportunities} />

                    <div>
                        <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <SitemapIcon className="w-5 h-5 text-purple-500" />
                          Suggested Outline to Beat Them
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar border border-gray-200 rounded-lg p-2">
                           {analysis.suggestedOutline.map(section => (
                             <div key={section.id} className="text-xs p-2 bg-gray-50 rounded">
                                 <p className="font-semibold text-gray-800">{section.heading}</p>
                                 <p className="text-gray-600 whitespace-pre-wrap">{section.keyPoints}</p>
                             </div>
                           ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AnalysisSection: React.FC<{title: string, icon: React.ReactNode, items: string[]}> = ({ title, icon, items }) => (
    <div>
        <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          {icon}
          {title}
        </h4>
        <ul className="list-disc list-inside bg-gray-50/70 p-3 rounded-lg text-gray-700 text-xs space-y-1 border border-gray-200">
            {items.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
    </div>
);


export default CompetitorAnalyzer;