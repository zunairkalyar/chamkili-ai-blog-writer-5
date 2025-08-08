import React, { useState } from 'react';
import { CalendarTopic } from '../services/geminiService';
import { SparkleIcon } from './icons/SparkleIcon';
import { SitemapIcon } from './icons/SitemapIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import ContentCalendarView from './ContentCalendarView';

interface DashboardProps {
  onSelectTopic: (topic: CalendarTopic) => void;
  onGoToGenerator: () => void;
  onGenerateCalendar: (goal: string, month: string) => Promise<void>;
  plan: CalendarTopic[] | null;
  isLoading: boolean;
  error: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectTopic, onGoToGenerator, onGenerateCalendar, plan, isLoading, error }) => {
    const today = new Date();
    const [goal, setGoal] = useState('Focus on monsoon season skincare, targeting issues like humidity-induced acne and frizz, while promoting a healthy glow.');
    const [month, setMonth] = useState(today.toLocaleString('default', { month: 'long' }));
    const [year, setYear] = useState(today.getFullYear());

    const handleGenerate = () => {
        onGenerateCalendar(goal, `${month} ${year}`);
    };

    return (
        <main className="container mx-auto px-4 py-8 md:py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-serif text-[#C57F5D]">Your Content Command Center</h1>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                    From strategic monthly planning to single-post creation, start your content journey here.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 text-center flex flex-col items-center">
                    <SitemapIcon className="w-12 h-12 text-[#C57F5D] mb-4" />
                    <h2 className="text-2xl font-bold font-serif mb-2">Create a Single Post</h2>
                    <p className="text-gray-600 mb-6 flex-grow">Have a specific idea? Jump right into the generator to craft a blog post or marketing campaign from scratch.</p>
                    <button
                        onClick={onGoToGenerator}
                        className="w-full flex items-center justify-center gap-2 bg-[#D18F70] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#C57F5D] transition-all transform hover:scale-105"
                    >
                        Go to Generator
                    </button>
                </div>
                 <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 text-center flex flex-col items-center">
                    <CalendarIcon className="w-12 h-12 text-[#C57F5D] mb-4" />
                    <h2 className="text-2xl font-bold font-serif mb-2">Plan Your Month</h2>
                    <p className="text-gray-600 mb-6 flex-grow">Let our AI act as your content strategist. Generate a full calendar of ideas based on your monthly goals.</p>
                     <a
                        href="#calendar-planner"
                        className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-all transform hover:scale-105"
                    >
                        Plan Content Calendar
                    </a>
                </div>
            </div>

            <div id="calendar-planner" className="pt-16 max-w-5xl mx-auto">
                 <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#C57F5D]">AI Content Calendar Planner</h2>
                    <p className="mt-3 text-md text-gray-600">Define your goal, and let the AI build your content strategy for the month.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 space-y-4">
                     <div>
                        <label htmlFor="calendarGoal" className="block text-sm font-medium text-gray-700 mb-1">
                            What is your main goal for this month's content?
                        </label>
                        <textarea
                            id="calendarGoal"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            placeholder="e.g., Promote our new Vitamin C serum for brighter skin..."
                            disabled={isLoading}
                        />
                    </div>
                     <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label htmlFor="monthSelect" className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                            <select id="monthSelect" value={month} onChange={e => setMonth(e.target.value)} disabled={isLoading} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                         <div className="flex-1">
                            <label htmlFor="yearSelect" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                            <input id="yearSelect" type="number" value={year} onChange={e => setYear(parseInt(e.target.value))} disabled={isLoading} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !goal.trim()}
                        className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                    >
                        {isLoading ? 'Planning...' : 'Generate Calendar'}
                    </button>
                </div>

                {error && (
                  <div className="mt-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
                    <p><span className="font-bold">Error:</span> {error}</p>
                  </div>
                )}

                 {isLoading && (
                     <div className="text-center py-10">
                        <div className="w-12 h-12 border-4 border-purple-400 border-dashed rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="font-medium text-gray-600">Your AI strategist is thinking...</p>
                        <p className="text-sm text-gray-500">Building your content plan for {month}.</p>
                    </div>
                 )}

                {plan && plan.length > 0 && (
                    <div className="mt-12">
                        <ContentCalendarView plan={plan} onSelectTopic={onSelectTopic} />
                    </div>
                )}
            </div>
        </main>
    );
};

export default Dashboard;
