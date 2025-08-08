import React from 'react';
import { CalendarTopic } from '../services/geminiService';
import { SparkleIcon } from './icons/SparkleIcon';

interface ContentCalendarViewProps {
  plan: CalendarTopic[];
  onSelectTopic: (topic: CalendarTopic) => void;
}

const ContentTypePill: React.FC<{ type: string }> = ({ type }) => {
    const colors: Record<string, string> = {
        'Standard Blog Post': 'bg-blue-100 text-blue-800',
        'Step-by-Step Guide': 'bg-green-100 text-green-800',
        'Product Deep Dive': 'bg-purple-100 text-purple-800',
        'Myth Busting': 'bg-yellow-100 text-yellow-800',
    };
    const colorClass = colors[type] || 'bg-gray-100 text-gray-800';
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClass}`}>{type}</span>;
}

const ContentCalendarView: React.FC<ContentCalendarViewProps> = ({ plan, onSelectTopic }) => {
  return (
    <div className="space-y-4">
      {plan.map((topic, index) => (
        <div key={index} className="bg-white p-4 rounded-xl shadow-md border border-gray-200 transition-all hover:shadow-lg hover:border-purple-200">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div className="flex-shrink-0 text-center md:w-24">
               <p className="text-3xl font-bold font-serif text-[#C57F5D]">{new Date(topic.date).getDate()}</p>
               <p className="text-sm text-gray-500">{new Date(topic.date).toLocaleString('default', { month: 'short' })}</p>
            </div>
            <div className="flex-grow border-t md:border-t-0 md:border-l border-gray-200 pt-3 md:pt-0 md:pl-4">
              <div className="mb-2">
                <ContentTypePill type={topic.contentType} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">{topic.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-semibold">Keywords:</span> {topic.keywords}
              </p>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md mt-2">
                <span className="font-semibold">Angle:</span> {topic.notes}
              </p>
            </div>
            <div className="flex-shrink-0 self-center">
              <button
                onClick={() => onSelectTopic(topic)}
                className="flex items-center justify-center gap-2 bg-[#D18F70] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#C57F5D] transition-all transform hover:scale-105"
              >
                <SparkleIcon className="w-5 h-5" />
                Write This Post
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContentCalendarView;
