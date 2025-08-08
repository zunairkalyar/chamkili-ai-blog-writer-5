import React, { useState } from 'react';
import { SeoFaqData } from '../services/geminiService';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { SeoIcon } from './icons/SeoIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';


interface SeoDisplayProps {
  isLoading: boolean;
  seoData: SeoFaqData | null;
  error: string | null;
  selectedTitleIndex: number;
  onSelectTitleIndex: (index: number) => void;
  selectedDescriptionIndex: number;
  onSelectDescriptionIndex: (index: number) => void;
  faqHtml: string;
}

export const SeoDisplay: React.FC<SeoDisplayProps> = ({
  isLoading,
  seoData,
  error,
  selectedTitleIndex,
  onSelectTitleIndex,
  selectedDescriptionIndex,
  onSelectDescriptionIndex,
  faqHtml,
}) => {
  const [isFaqCopied, setIsFaqCopied] = useState(false);

  const handleCopyFaq = () => {
    // We need to strip the HTML for a clean copy, or create plain text version
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = faqHtml;
    const textToCopy = tempDiv.innerText || "";

    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsFaqCopied(true);
      setTimeout(() => setIsFaqCopied(false), 2500);
    });
  };

  if (isLoading) {
    return (
      <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-200 flex items-center justify-center text-center text-gray-500">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#C57F5D]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span>Generating SEO content & FAQ...</span>
      </div>
    );
  }

  if (error) {
    return (
       <div className="mt-8 bg-red-50 rounded-2xl p-6 border border-red-200 text-red-800">
        <p><span className="font-bold">Could not generate SEO content:</span> {error}</p>
      </div>
    );
  }

  if (!seoData) {
    return null; // Don't render anything if there's no data and not loading/error
  }
  
  const selectedTitle = seoData.metaTitles[selectedTitleIndex] || '';
  const selectedDescription = seoData.metaDescriptions[selectedDescriptionIndex] || '';

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-xl font-serif font-bold text-[#C57F5D] mb-4 flex items-center gap-3">
        <SeoIcon className="w-6 h-6"/> SEO & Additional Content
      </h3>
      <div className="space-y-6">
        
        {/* Key Takeaways */}
        {seoData.keyTakeaways && seoData.keyTakeaways.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <LightbulbIcon className="w-5 h-5 text-yellow-500" />
              Key Takeaways
            </h4>
            <ul className="list-disc list-inside bg-gray-50/70 p-4 rounded-lg text-gray-700 text-sm space-y-1 border border-gray-200">
              {seoData.keyTakeaways.map((takeaway, index) => (
                <li key={index}>{takeaway}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Meta Title Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Meta Title Options</label>
           <p className="text-xs text-gray-500 mt-1 mb-2">Select the best title. It appears in the Google search result link. Aim for under 60 characters.</p>
          <div className="space-y-2 rounded-lg border border-gray-200 p-3">
            {seoData.metaTitles.map((title, index) => (
                <label key={index} htmlFor={`title-${index}`} className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                    <input
                        type="radio"
                        id={`title-${index}`}
                        name="metaTitle"
                        checked={selectedTitleIndex === index}
                        onChange={() => onSelectTitleIndex(index)}
                        className="mt-1 h-4 w-4 text-[#C57F5D] border-gray-300 focus:ring-[#C57F5D]"
                    />
                    <span className="flex-1 text-sm text-gray-800">{title}
                      <span className={`ml-2 text-xs ${title.length > 60 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>({title.length})</span>
                    </span>
                </label>
            ))}
          </div>
        </div>
        
        {/* Meta Description Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Meta Description Options</label>
          <p className="text-xs text-gray-500 mt-1 mb-2">Select the best summary for search results. Aim for under 160 characters.</p>
           <div className="space-y-2 rounded-lg border border-gray-200 p-3">
            {seoData.metaDescriptions.map((desc, index) => (
                <label key={index} htmlFor={`desc-${index}`} className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                    <input
                        type="radio"
                        id={`desc-${index}`}
                        name="metaDescription"
                        checked={selectedDescriptionIndex === index}
                        onChange={() => onSelectDescriptionIndex(index)}
                        className="mt-1 h-4 w-4 text-[#C57F5D] border-gray-300 focus:ring-[#C57F5D]"
                    />
                     <span className="flex-1 text-sm text-gray-800">{desc}
                      <span className={`ml-2 text-xs ${desc.length > 160 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>({desc.length})</span>
                    </span>
                </label>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        {seoData.faq && seoData.faq.length > 0 && (
           <div>
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-700">Generated FAQ Section Preview</h4>
                 <button
                    onClick={handleCopyFaq}
                    className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded-md text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                  >
                  {isFaqCopied ? <CheckIcon className="w-3 h-3 text-green-600" /> : <CopyIcon className="w-3 h-3" />}
                  {isFaqCopied ? 'Copied Text' : 'Copy Text'}
                </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 space-y-2">
                <div dangerouslySetInnerHTML={{ __html: faqHtml }} />
            </div>
            <p className="text-xs text-gray-500 mt-1">This FAQ section will be automatically appended to the blog post when publishing.</p>
          </div>
        )}
      </div>
    </div>
  );
};