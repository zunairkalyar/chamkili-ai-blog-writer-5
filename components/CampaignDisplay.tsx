import React, { useState } from 'react';
import { BlogPostDisplay, ContentBlock } from './BlogPostDisplay';
import { ImageState } from '../App';
import { CampaignAsset, GeneratedAd, GeneratedEmail } from '../services/geminiService';
import { InstagramIcon } from './icons/InstagramIcon';
import { MailIcon } from './icons/MailIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { SitemapIcon } from './icons/SitemapIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';

interface GeneratedCampaignAssets {
    social: CampaignAsset[];
    emails: GeneratedEmail[];
    ads: GeneratedAd[];
}

interface CampaignDisplayProps {
    blogPost: {
        blocks: ContentBlock[];
        imageStates: Record<string, ImageState>;
    };
    campaignAssets: GeneratedCampaignAssets | null;
    isLoading: boolean;
    onRetryImage: (id: string) => void;
    onUpdateImagePrompt: (id: string, newPrompt: string) => void;
}

type Tab = 'blog' | 'social' | 'email' | 'ads';

const AssetIcon: React.FC<{type: string, className?: string}> = ({type, className="w-5 h-5"}) => {
    switch(type) {
        case 'twitter': return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>;
        case 'linkedin': return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.25 6.5 1.75 1.75 0 016.5 8.25zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93-.94 0-1.62.68-1.62 1.93V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.42c2.28 0 3.1 1.7 3.1 3.98z"></path></svg>;
        case 'instagram': return <InstagramIcon className={className}/>;
        case 'email': return <MailIcon className={className}/>;
        case 'ads': return <MegaphoneIcon className={className} stroke="currentColor" fill="none"/>;
        case 'blog': return <SitemapIcon className={className} stroke="currentColor" fill="none" />;
        default: return null;
    }
}

const CopyButton: React.FC<{textToCopy: string}> = ({textToCopy}) => {
    const [isCopied, setIsCopied] = useState(false);
    const handleCopy = () => {
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
        });
    };
    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 border border-gray-200 rounded-md text-xs text-gray-600 hover:bg-gray-200"
         >
             {isCopied ? <CheckIcon className="w-3 h-3 text-green-600" /> : <CopyIcon className="w-3 h-3" />}
             {isCopied ? 'Copied!' : 'Copy'}
         </button>
    )
}

const CampaignDisplay: React.FC<CampaignDisplayProps> = ({ blogPost, campaignAssets, isLoading, onRetryImage, onUpdateImagePrompt}) => {
    const [activeTab, setActiveTab] = useState<Tab>('blog');

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 min-h-[60vh] flex items-center justify-center">
                 <div className="text-center text-gray-500">
                    <div className="w-16 h-16 border-4 border-[#D18F70] border-dashed rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-medium">Generating Your Campaign Assets...</p>
                    <p className="text-sm">First the blog, then all other content. This may take a moment.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
                 <div className="flex space-x-1 border-b-2 border-gray-100 overflow-x-auto pb-1">
                    <button 
                        onClick={() => setActiveTab('blog')} 
                        className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${activeTab === 'blog' ? 'border-b-2 border-[#C57F5D] text-[#C57F5D]' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        <AssetIcon type="blog"/> Blog Post
                    </button>
                    {campaignAssets?.social && (
                        <button 
                            onClick={() => setActiveTab('social')} 
                            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors capitalize ${activeTab === 'social' ? 'border-b-2 border-[#C57F5D] text-[#C57F5D]' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                           <AssetIcon type="instagram"/> Social Posts
                        </button>
                    )}
                     {campaignAssets?.emails && (
                        <button 
                            onClick={() => setActiveTab('email')} 
                            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors capitalize ${activeTab === 'email' ? 'border-b-2 border-[#C57F5D] text-[#C57F5D]' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                           <AssetIcon type="email"/> Emails
                        </button>
                    )}
                     {campaignAssets?.ads && (
                        <button 
                            onClick={() => setActiveTab('ads')} 
                            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors capitalize ${activeTab === 'ads' ? 'border-b-2 border-[#C57F5D] text-[#C57F5D]' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                           <AssetIcon type="ads"/> Ad Copy
                        </button>
                    )}
                 </div>
            </div>
            <div className="bg-gray-50/50">
                {activeTab === 'blog' && (
                    <div className="bg-white">
                        <BlogPostDisplay
                            blocks={blogPost.blocks}
                            imageStates={blogPost.imageStates}
                            isLoading={isLoading && blogPost.blocks.length === 0}
                            onRetryImage={onRetryImage}
                            onUpdateImagePrompt={onUpdateImagePrompt}
                        />
                    </div>
                )}
                {activeTab === 'social' && campaignAssets?.social && (
                     <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {campaignAssets.social.map(asset => (
                            <div key={asset.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-3">
                                        <AssetIcon type={asset.type} className="w-6 h-6"/>
                                        <h3 className="font-bold text-lg text-gray-800 capitalize">{asset.type} Post</h3>
                                    </div>
                                    <CopyButton textToCopy={asset.content} />
                                </div>
                                <p className="text-sm text-gray-500 italic mb-3">Topic: {asset.topic}</p>
                                <textarea readOnly value={asset.content} rows={12} className="w-full bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm whitespace-pre-wrap font-mono"/>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'email' && campaignAssets?.emails && (
                     <div className="p-6 space-y-6">
                        {campaignAssets.emails.map((email, index) => (
                             <div key={email.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-center mb-3 pb-3 border-b">
                                    <h3 className="font-bold text-lg text-gray-800 capitalize">Email {index + 1}</h3>
                                    <CopyButton textToCopy={`Subject: ${email.subject}\n\n${email.body}`} />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm"><span className="font-semibold">Subject:</span> {email.subject}</p>
                                    <textarea readOnly value={email.body} rows={12} className="w-full bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm whitespace-pre-wrap font-mono"/>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                 {activeTab === 'ads' && campaignAssets?.ads && (
                     <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {campaignAssets.ads.map(ad => (
                             <div key={ad.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-center mb-3">
                                     <h3 className="font-bold text-lg text-gray-800 capitalize">Ad Copy</h3>
                                     <CopyButton textToCopy={`Headline: ${ad.headline}\nBody: ${ad.body}`} />
                                </div>
                                <div className="space-y-2">
                                     <div>
                                        <label className="text-xs font-semibold text-gray-500">Headline</label>
                                        <p className="text-sm p-2 bg-gray-50 rounded border">{ad.headline}</p>
                                     </div>
                                      <div>
                                        <label className="text-xs font-semibold text-gray-500">Body</label>
                                        <p className="text-sm p-2 bg-gray-50 rounded border">{ad.body}</p>
                                     </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CampaignDisplay;