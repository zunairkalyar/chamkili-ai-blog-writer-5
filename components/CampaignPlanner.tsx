import React from 'react';
import { CampaignPlan } from '../services/geminiService';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { MailIcon } from './icons/MailIcon';

interface CampaignPlannerProps {
    plan: CampaignPlan;
    onApprove: (plan: CampaignPlan) => void;
    onCancel: () => void;
    isGenerating: boolean;
}

const AssetIcon: React.FC<{type: string, className?: string}> = ({type, className='w-5 h-5'}) => {
    switch(type) {
        case 'twitter': return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>;
        case 'linkedin': return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.25 6.5 1.75 1.75 0 016.5 8.25zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93-.94 0-1.62.68-1.62 1.93V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.42c2.28 0 3.1 1.7 3.1 3.98z"></path></svg>;
        case 'instagram': return <InstagramIcon className={className}/>;
        case 'email': return <MailIcon className={className}/>;
        default: return null;
    }
}

const CampaignPlanner: React.FC<CampaignPlannerProps> = ({ plan, onApprove, onCancel, isGenerating }) => {
    
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 space-y-8">
            <div className="text-center">
                <MegaphoneIcon className="w-12 h-12 mx-auto text-[#C57F5D] mb-2" />
                <h2 className="text-2xl font-bold font-serif text-[#3D2C21]">Campaign Plan</h2>
                <p className="text-gray-500 mt-1">Review the AI's strategic plan for your marketing campaign.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Blog Post Outline */}
                <div className="space-y-4 lg:col-span-1">
                    <h3 className="text-lg font-bold font-serif text-[#3D2C21] border-b pb-2">Cornerstone Blog Post</h3>
                     <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                        {plan.blogPostOutline.map((item) => (
                            <div key={item.id} className="p-3 bg-gray-50/70 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-md text-[#C57F5D]">{item.heading}</h4>
                                <div className="prose prose-sm text-gray-600 mt-1 whitespace-pre-wrap">
                                    {item.keyPoints}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Social and Email */}
                <div className="space-y-6 lg:col-span-1">
                     <div className="space-y-4">
                        <h3 className="text-lg font-bold font-serif text-[#3D2C21] border-b pb-2">Social Media Posts</h3>
                        <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                            {plan.socialAssetPlan.map((asset) => (
                                <div key={asset.id} className="p-3 bg-gray-50/70 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <AssetIcon type={asset.type} className="w-5 h-5" />
                                        <h4 className="font-semibold text-md text-gray-700 capitalize">{asset.type} Post</h4>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 pl-8">{asset.topic}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                 {/* Ads and Emails */}
                <div className="space-y-6 lg:col-span-1">
                     <div className="space-y-4">
                        <h3 className="text-lg font-bold font-serif text-[#3D2C21] border-b pb-2">Email Drip Campaign</h3>
                        <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                            {plan.emailDripPlan.map((email, index) => (
                                <div key={email.id} className="p-3 bg-gray-50/70 rounded-lg border border-gray-200">
                                    <h4 className="font-semibold text-md text-gray-700 capitalize">Email {index + 1}: <span className="font-normal">{email.subject}</span></h4>
                                    <p className="text-sm text-gray-600 mt-1">{email.topic}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div className="space-y-4">
                        <h3 className="text-lg font-bold font-serif text-[#3D2C21] border-b pb-2">Ad Copy Variations</h3>
                        <div className="space-y-3">
                             {plan.adCopyPlan.map((ad) => (
                                <div key={ad.id} className="p-3 bg-gray-50/70 rounded-lg border border-gray-200">
                                    <h4 className="font-semibold text-md text-gray-700 capitalize">{ad.headline}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{ad.purpose}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6 border-t border-gray-200">
                <button 
                    onClick={onCancel}
                    disabled={isGenerating}
                    className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-60"
                >
                    Cancel & Start Over
                </button>
                <button 
                    onClick={() => onApprove(plan)}
                    disabled={isGenerating}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <SparkleIcon className="w-5 h-5" />
                    Approve & Generate All Assets
                </button>
            </div>
        </div>
    );
};

export default CampaignPlanner;