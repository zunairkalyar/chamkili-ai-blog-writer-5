import React, { useState, useCallback, useEffect, useId, useMemo } from 'react';
import { 
  generateBlogOutline,
  generateBlogPostStream, 
  generateImage, 
  generateSeoAndFaq, 
  analyzeBrandVoice,
  analyzeBrandVoiceFromUrl,
  regenerateOutlineSection,
  repurposeContent,
  generateCampaignPlan,
  analyzeCompetitorUrl,
  getSeoScore,
  rewriteText,
  getTrendingTopics,
  generateCustomerPersona,
  generateSingleCampaignAsset,
  generateCampaignEmail,
  generateCampaignAd,
  generateContentCalendar,
  SeoFaqData,
  OutlineBlock,
  CampaignPlan,
  CampaignAsset,
  CompetitorAnalysis,
  SeoScore,
  TrendingTopicResult,
  CustomerPersona,
  SocialAssetPlan,
  EmailPlan,
  AdPlan,
  GeneratedEmail,
  GeneratedAd,
  CalendarTopic,
} from './services/geminiService';
import { v4 as uuidv4 } from 'uuid';

import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import { updateGeminiSettings, getCurrentSettings, type GeminiSettings } from './services/geminiService';
import { BlogPostDisplay, ContentBlock } from './components/BlogPostDisplay';
import { SparkleIcon } from './components/icons/SparkleIcon';
import { TrashIcon } from './components/icons/TrashIcon';
import ShopifyModal from './components/ShopifyModal';
import { ShopifyIcon } from './components/icons/ShopifyIcon';
import { getBlogs, createArticle, ShopifyBlog, ShopifyCredentials, CHAMKILI_CREDENTIALS } from './services/shopifyService';
import { convertBlocksToHtml, convertFaqToHtml, convertBlocksToText } from './utils/contentUtils';
import { generateBlogLinksHTML, getRelatedBlogLinks, fetchChamkiliBlogSitemap, getRecentBlogLinks, type BlogLink } from './services/sitemapService';
import { UploadIcon } from './components/icons/UploadIcon';
import { XCircleIcon } from './components/icons/XCircleIcon';
import { SeoDisplay } from './components/SeoDisplay';
import { BrainCircuitIcon } from './components/icons/BrainCircuitIcon';
import { SitemapIcon } from './components/icons/SitemapIcon';
import BrandVoiceModal from './components/BrandVoiceModal';
import OutlineEditor from './components/OutlineEditor';
import RepurposePanel from './components/RepurposePanel';
import CampaignPlanner from './components/CampaignPlanner';
import { MegaphoneIcon } from './components/icons/MegaphoneIcon';
import CampaignDisplay from './components/CampaignDisplay';
import { SearchIcon } from './components/icons/SearchIcon';
import { GaugeIcon } from './components/icons/GaugeIcon';
import CompetitorAnalyzer from './components/CompetitorAnalyzer';
import SeoScoreDisplay from './components/SeoScoreDisplay';
import MagicWandMenu, { RewriteInstruction } from './components/MagicWandMenu';
import { TrendingUpIcon } from './components/icons/TrendingUpIcon';
import TrendSpotter from './components/TrendSpotter';
import PersonaGenerator from './components/PersonaGenerator';
import { UsersIcon } from './components/icons/UsersIcon';
import Dashboard from './components/Dashboard';
import { LayoutDashboardIcon } from './components/icons/LayoutDashboardIcon';
import ShopifyDebugger from './components/ShopifyDebugger';
import { ImageServiceTester } from './components/ImageServiceTester';
import { SettingsIcon } from './components/icons/SettingsIcon';


const TONES = ['Warm & Friendly', 'Professional', 'Playful', 'Scientific', 'Empathetic'];
const ASPECT_RATIOS = {
  'Landscape (16:9)': '16:9',
  'Portrait (9:16)': '9:16',
  'Square (1:1)': '1:1',
  'Standard (4:3)': '4:3',
  'Tall (3:4)': '3:4',
};
const CONTENT_TEMPLATES = ['Standard Blog Post', 'Step-by-Step Guide', 'Product Deep Dive', 'Myth Busting'];
const AUTHOR_PERSONAS = ['Beauty Guru', 'The Dermatologist', 'Skincare Scientist'];
const IMAGE_STYLES = ['Default', 'Minimalist & Clean', 'Lush & Organic', 'Luxury & Gold', 'Vibrant & Playful'];


export interface ImageState {
  status: 'loading' | 'success' | 'error';
  url?: string;
  prompt: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  outline: OutlineBlock[];
  content: ContentBlock[];
  tone: string;
  keywords: string;
  aspectRatio: string;
  seoData: SeoFaqData | null;
  contentTemplate: string;
  authorPersona: string;
  imageStyle: string;
  negativeImagePrompt: string;
  customerPersona: CustomerPersona | null;
}

interface ReferenceImage {
    file: File;
    preview: string;
}

interface GeneratedCampaignAssets {
    social: CampaignAsset[];
    emails: GeneratedEmail[];
    ads: GeneratedAd[];
}


type AppState = 'ideation' | 'outline' | 'campaign_plan' | 'generated';
type AppMode = 'blog' | 'campaign';
type View = 'dashboard' | 'generator';
export type RepurposePlatform = 'twitter' | 'linkedin' | 'instagram' | 'email';

interface MagicWandState {
  visible: boolean;
  top: number;
  left: number;
  selectedText: string;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); 
    };
    reader.onerror = (error) => reject(error);
  });
};


const App: React.FC = () => {
  const formId = useId();
  // App flow state
  const [view, setView] = useState<View>('dashboard');
  const [appMode, setAppMode] = useState<AppMode>('blog');
  const [appState, setAppState] = useState<AppState>('ideation');

  // Form state
  const [blogTitle, setBlogTitle] = useState<string>('');
  const [campaignGoal, setCampaignGoal] = useState<string>('');
  const [seoKeywords, setSeoKeywords] = useState<string>('');
  const [tone, setTone] = useState<string>(TONES[0]);
  const [aspectRatio, setAspectRatio] = useState<string>(ASPECT_RATIOS['Landscape (16:9)']);
  const [referenceImage, setReferenceImage] = useState<ReferenceImage | null>(null);

  // Creative controls state
  const [contentTemplate, setContentTemplate] = useState<string>(CONTENT_TEMPLATES[0]);
  const [authorPersona, setAuthorPersona] = useState<string>(AUTHOR_PERSONAS[0]);
  const [imageStyle, setImageStyle] = useState<string>(IMAGE_STYLES[0]);
  const [negativeImagePrompt, setNegativeImagePrompt] = useState<string>('');
  const [brandVoiceProfile, setBrandVoiceProfile] = useState<string | null>(null);
  const [isBrandVoiceModalOpen, setIsBrandVoiceModalOpen] = useState(false);
  const [customerPersona, setCustomerPersona] = useState<CustomerPersona | null>(null);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);

  // Generation state
  const [outline, setOutline] = useState<OutlineBlock[] | null>(null);
  const [campaignPlan, setCampaignPlan] = useState<CampaignPlan | null>(null);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [campaignAssets, setCampaignAssets] = useState<GeneratedCampaignAssets | null>(null);
  const [imageStates, setImageStates] = useState<Record<string, ImageState>>({});
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState<boolean>(false);
  const [isRegeneratingSection, setIsRegeneratingSection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Repurposing state
  const [repurposedContent, setRepurposedContent] = useState<{ platform: string; content: string } | null>(null);
  const [isRepurposing, setIsRepurposing] = useState(false);

  // Calendar State
  const [calendarPlan, setCalendarPlan] = useState<CalendarTopic[] | null>(null);
  const [isGeneratingCalendar, setIsGeneratingCalendar] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);


  // SEO, Competitor & Trends State
  const [seoData, setSeoData] = useState<SeoFaqData | null>(null);
  const [selectedTitleIndex, setSelectedTitleIndex] = useState(0);
  const [selectedDescriptionIndex, setSelectedDescriptionIndex] = useState(0);
  const [seoScore, setSeoScore] = useState<SeoScore | null>(null);
  const [isGeneratingSeo, setIsGeneratingSeo] = useState<boolean>(false);
  const [isGeneratingSeoScore, setIsGeneratingSeoScore] = useState<boolean>(false);
  const [seoError, setSeoError] = useState<string | null>(null);
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [competitorAnalysis, setCompetitorAnalysis] = useState<CompetitorAnalysis | null>(null);
  const [isAnalyzingCompetitor, setIsAnalyzingCompetitor] = useState(false);
  const [competitorError, setCompetitorError] = useState<string | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopicResult | null>(null);
  const [isFetchingTrends, setIsFetchingTrends] = useState(false);
  const [trendsError, setTrendsError] = useState<string | null>(null);


  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historySearchTerm, setHistorySearchTerm] = useState('');


  // Shopify state
  const [isShopifyModalOpen, setIsShopifyModalOpen] = useState(false);
  const [shopifyCreds, setShopifyCreds] = useState<ShopifyCredentials>({ storeName: '', accessToken: '' });
  const [shopifyBlogs, setShopifyBlogs] = useState<ShopifyBlog[]>([]);
  const [selectedShopifyBlog, setSelectedShopifyBlog] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [isFetchingBlogs, setIsFetchingBlogs] = useState(false);
  
  // UI State
  const [activePanels, setActivePanels] = useState<string[]>(['main', 'creative', 'geminiSettings', 'shopifySettings']);
  const [magicWand, setMagicWand] = useState<MagicWandState>({ visible: false, top: 0, left: 0, selectedText: '' });
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewrittenText, setRewrittenText] = useState<string | null>(null);
  
  // Settings State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [geminiSettings, setGeminiSettings] = useState<GeminiSettings>(() => getCurrentSettings());


  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('chamkiliBlogHistoryV6');
      if (storedHistory) setHistory(JSON.parse(storedHistory));

      // Always use hardcoded Chamkili credentials
      setShopifyCreds(CHAMKILI_CREDENTIALS);
      localStorage.setItem('chamkiliShopifyCreds', JSON.stringify(CHAMKILI_CREDENTIALS));
      console.log('✅ Chamkili Shopify credentials loaded automatically');

      const storedBrandVoice = localStorage.getItem('chamkiliBrandVoice');
      if (storedBrandVoice) setBrandVoiceProfile(storedBrandVoice);
      
      const storedPersona = localStorage.getItem('chamkiliCustomerPersona');
      if (storedPersona) setCustomerPersona(JSON.parse(storedPersona));
      
      // Load Gemini settings from localStorage
      const storedGeminiSettings = localStorage.getItem('chamkiliGeminiSettings');
      if (storedGeminiSettings) {
        try {
          const parsedSettings = JSON.parse(storedGeminiSettings);
          setGeminiSettings(parsedSettings);
          updateGeminiSettings(parsedSettings);
        } catch (settingsError) {
          console.error('Error parsing Gemini settings:', settingsError);
          // Use default settings if parsing fails
          const defaultSettings = getCurrentSettings();
          setGeminiSettings(defaultSettings);
        }
      } else {
        // Initialize with current settings if none stored
        const currentSettings = getCurrentSettings();
        setGeminiSettings(currentSettings);
        localStorage.setItem('chamkiliGeminiSettings', JSON.stringify(currentSettings));
      }

    } catch (e) {
      console.error("Could not parse from localStorage", e);
      localStorage.removeItem('chamkiliBlogHistoryV6');
      localStorage.removeItem('chamkiliCustomerPersona');
    }
  }, []);

  useEffect(() => {
    if (shopifyCreds.storeName && shopifyCreds.accessToken) {
      setIsFetchingBlogs(true);
      setPublishError(null);
      getBlogs(shopifyCreds)
        .then(blogs => {
          setShopifyBlogs(blogs);
          if (blogs.length > 0) setSelectedShopifyBlog(String(blogs[0].id));
        })
        .catch(err => {
            console.error("Failed to fetch Shopify blogs", err);
            setPublishError(`Failed to fetch blogs. Check credentials or CORS proxy. Error: ${err.message}`);
        })
        .finally(() => setIsFetchingBlogs(false));
    }
  }, [shopifyCreds]);

  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem('chamkiliBlogHistoryV6', JSON.stringify(newHistory));
  };
  
  const handleImageGeneration = async (id: string, prompt: string, ratio: string, style: string, negativePrompt: string) => {
      try {
        const imageUrl = await generateImage(prompt, ratio, style, negativePrompt);
        setImageStates(prev => ({ ...prev, [id]: { status: 'success', url: imageUrl, prompt } }));
      } catch (err) {
        console.error('Image generation failed for prompt:', prompt, err);
        setImageStates(prev => ({ ...prev, [id]: { status: 'error', prompt: prompt } }));
      }
  };

  const resetAll = () => {
    setAppState('ideation');
    setError(null);
    setPublishError(null);
    setPublishSuccess(null);
    setContentBlocks([]);
    setImageStates({});
    setSeoData(null);
    setSelectedTitleIndex(0);
    setSelectedDescriptionIndex(0);
    setSeoError(null);
    setIsGeneratingSeo(false);
    setIsGeneratingSeoScore(false);
    setOutline(null);
    setCampaignPlan(null);
    setCampaignAssets(null);
    setRepurposedContent(null);
    setSeoScore(null);
    setCompetitorAnalysis(null);
    setCompetitorError(null);
    setTrendingTopics(null);
    setTrendsError(null);
    setCalendarPlan(null);
    setCalendarError(null);
    setIsRepurposing(false);
    setIsRewriting(false);
    setRewrittenText(null);
    setMagicWand({ visible: false, top: 0, left: 0, selectedText: '' });
  }

  const handleGenerateOutline = async () => {
    // Always reset everything first to ensure fresh generation
    resetAll();
    setIsGeneratingOutline(true);
    
    const finalTitle = blogTitle.trim() === '' ? 'Best Skincare Routine for Glowing Skin in Pakistan' : blogTitle.trim();
    
    // Add timestamp to ensure uniqueness
    const timestamp = Date.now();
    console.log(`Starting fresh blog generation at ${timestamp} for title: "${finalTitle}"`);
    
    try {
      if (appMode === 'blog') {
        // Generate completely new outline with timestamp for uniqueness
        const generatedOutline = await generateBlogOutline(
          finalTitle, 
          seoKeywords, 
          contentTemplate, 
          authorPersona, 
          brandVoiceProfile, 
          customerPersona
        );
        
        // Ensure each outline block has a new unique ID
        const freshOutline = generatedOutline.map(block => ({
          ...block,
          id: `${block.id}_${timestamp}`
        }));
        
        setOutline(freshOutline);
        setAppState('outline');
      } else { // Campaign mode
        const generatedPlan = await generateCampaignPlan(campaignGoal, brandVoiceProfile, customerPersona);
        setCampaignPlan(generatedPlan);
        setAppState('campaign_plan');
      }
    } catch (err) {
       setError(err instanceof Error ? err.message : 'An unknown error occurred creating the plan.');
    } finally {
      setIsGeneratingOutline(false);
    }
  }
  
  const handleRegenerateSection = async (sectionId: string) => {
    if (!outline) return;
    const sectionIndex = outline.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;

    setIsRegeneratingSection(sectionId);
    setError(null);
    const finalTitle = blogTitle.trim() === '' ? 'Best Skincare Routine for Glowing Skin in Pakistan' : blogTitle.trim();

    try {
      const regeneratedSection = await regenerateOutlineSection(
        finalTitle, 
        outline[sectionIndex].heading
      );
      
      const newOutline = [...outline];
      newOutline[sectionIndex] = { ...newOutline[sectionIndex], ...regeneratedSection };
      setOutline(newOutline);

    } catch (err) {
      setError(err instanceof Error ? `Failed to regenerate section: ${err.message}` : 'An unknown error occurred during regeneration.');
    } finally {
      setIsRegeneratingSection(null);
    }
  };

  const handleGenerateFullArticle = useCallback(async (approvedOutline: OutlineBlock[]) => {
    if (!approvedOutline || approvedOutline.length === 0) return;
    
    // Force fresh generation state
    setAppState('generated');
    setIsGenerating(true);
    setError(null);
    setSeoData(null);
    setSeoScore(null);
    setContentBlocks([]);
    setImageStates({});
    setRepurposedContent(null);
    
    // Clear any previous SEO/competitor/trends data to ensure fresh generation
    setCompetitorAnalysis(null);
    setCompetitorError(null);
    setTrendingTopics(null);
    setTrendsError(null);

    const finalTitle = blogTitle.trim() === '' ? 'Best Skincare Routine for Glowing Skin in Pakistan' : blogTitle.trim();
    
    try {
      let imageDetails = null;
      if (referenceImage) {
        const base64Data = await fileToBase64(referenceImage.file);
        imageDetails = { data: base64Data, mimeType: referenceImage.file.type };
      }
      
      const historicalTitles = history.map(h => h.title);

      const stream = generateBlogPostStream(finalTitle, tone, seoKeywords, imageDetails, contentTemplate, authorPersona, brandVoiceProfile, approvedOutline, historicalTitles, customerPersona);
      const imageGenPromises: Promise<void>[] = [];
      let tempBlocks: ContentBlock[] = [];

      for await (const block of stream) {
        const blockId = uuidv4();
        let newBlock: ContentBlock;
        if (block.type === 'image_suggestion') {
          newBlock = { id: blockId, type: 'image', data: { prompt: block.content } };
          setImageStates(prev => ({...prev, [blockId]: { status: 'loading', prompt: block.content } }));
          imageGenPromises.push(handleImageGeneration(blockId, block.content, aspectRatio, imageStyle, negativeImagePrompt));
        } else {
          newBlock = { id: blockId, type: 'html', data: { html: block.content } };
        }
        tempBlocks.push(newBlock);
        setContentBlocks([...tempBlocks]);
      }
      
      // Add blog links section after main content
      try {
        console.log('Adding related blog links section...');
        const allBlogLinks = await fetchChamkiliBlogSitemap();
        const relatedLinks = getRelatedBlogLinks(finalTitle, allBlogLinks, 3);
        
        // If no related links found, get some recent ones
        const linksToUse = relatedLinks.length > 0 ? relatedLinks : getRecentBlogLinks(allBlogLinks, 3);
        
        if (linksToUse.length > 0) {
          const blogLinksHTML = generateBlogLinksHTML(linksToUse);
          const linksBlockId = uuidv4();
          const linksBlock: ContentBlock = {
            id: linksBlockId,
            type: 'html',
            data: { html: blogLinksHTML }
          };
          tempBlocks.push(linksBlock);
          setContentBlocks([...tempBlocks]);
          console.log(`Added ${linksToUse.length} blog links to the post`);
        }
      } catch (error) {
        console.error('Failed to add blog links:', error);
        // Continue without links if there's an error
      }
      
      await Promise.all(imageGenPromises);

      setIsGeneratingSeo(true);
      let finalSeoData: SeoFaqData | null = null;
      try {
        const contentForSeo = tempBlocks.filter(b => b.type === 'html').map(b => b.data.html).join(' ');
        const generatedSeo = await generateSeoAndFaq(contentForSeo, finalTitle, seoKeywords);
        setSeoData(generatedSeo);
        setSelectedTitleIndex(0);
        setSelectedDescriptionIndex(0);
        finalSeoData = generatedSeo;
      } catch (seoErr) {
        setSeoError(seoErr instanceof Error ? seoErr.message : 'Failed to generate SEO content.');
      } finally {
        setIsGeneratingSeo(false);
      }

      const newHistoryItem: HistoryItem = {
        id: uuidv4(),
        title: finalTitle,
        outline: approvedOutline,
        content: tempBlocks, 
        tone,
        keywords: seoKeywords,
        aspectRatio,
        seoData: finalSeoData,
        contentTemplate,
        authorPersona,
        imageStyle,
        negativeImagePrompt,
        customerPersona,
      };
      if (appMode === 'blog') {
        const updatedHistory = [newHistoryItem, ...history.slice(0, 19)];
        saveHistory(updatedHistory);
      }
      return tempBlocks;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [blogTitle, seoKeywords, tone, aspectRatio, referenceImage, history, contentTemplate, authorPersona, imageStyle, negativeImagePrompt, brandVoiceProfile, customerPersona, appMode]);

  const handleGenerateCampaign = async (approvedPlan: CampaignPlan) => {
     setCampaignPlan(approvedPlan);
     setAppState('generated');
     setIsGenerating(true);
     setError(null);
     setCampaignAssets(null);

     // 1. Generate Blog Post
     const blogBlocks = await handleGenerateFullArticle(approvedPlan.blogPostOutline);
     
     if (blogBlocks) {
        const blogText = convertBlocksToText(blogBlocks);
        
        // 2. Generate other assets in parallel
        const socialPromises = approvedPlan.socialAssetPlan.map(assetPlan => 
          generateSingleCampaignAsset(blogText, assetPlan, brandVoiceProfile, customerPersona)
            .then(content => ({...assetPlan, content, topic: assetPlan.topic, type: assetPlan.type, id: assetPlan.id }))
            .catch(e => ({...assetPlan, content: `Error generating content: ${e.message}`, topic: assetPlan.topic, type: assetPlan.type, id: assetPlan.id}))
        );

        const emailPromises = approvedPlan.emailDripPlan.map(emailPlan =>
            generateCampaignEmail(blogText, emailPlan, brandVoiceProfile, customerPersona)
                .catch(e => ({...emailPlan, body: `Error generating email body: ${e.message}`}))
        );

        const adPromises = approvedPlan.adCopyPlan.map(adPlan =>
            generateCampaignAd(blogText, adPlan, brandVoiceProfile, customerPersona)
                .catch(e => ({...adPlan, body: `Error generating ad body: ${e.message}`}))
        );

        const [socialAssets, emailAssets, adAssets] = await Promise.all([
            Promise.all(socialPromises),
            Promise.all(emailPromises),
            Promise.all(adPromises)
        ]);
        
        setCampaignAssets({ social: socialAssets, emails: emailAssets, ads: adAssets });
     }
     setIsGenerating(false);
  }

  const handleHistoryClick = (item: HistoryItem) => {
    resetAll();
    setAppMode('blog');
    setView('generator');
    setBlogTitle(item.title);
    setSeoKeywords(item.keywords);
    setTone(item.tone);
    setAspectRatio(item.aspectRatio);
    setReferenceImage(null);
    setContentTemplate(item.contentTemplate || CONTENT_TEMPLATES[0]);
    setAuthorPersona(item.authorPersona || AUTHOR_PERSONAS[0]);
    setImageStyle(item.imageStyle || IMAGE_STYLES[0]);
    setNegativeImagePrompt(item.negativeImagePrompt || '');
    setCustomerPersona(item.customerPersona || null);
    
    setOutline(item.outline);
    setContentBlocks(item.content);
    setSeoData(item.seoData || null);
    setSelectedTitleIndex(0);
    setSelectedDescriptionIndex(0);
    
    setAppState('generated');

    const newImageStates: Record<string, ImageState> = {};
    const currentImageStyle = item.imageStyle || IMAGE_STYLES[0];
    const currentNegativePrompt = item.negativeImagePrompt || '';

    item.content.forEach(block => {
      if (block.type === 'image') {
         newImageStates[block.id] = { status: 'loading', prompt: block.data.prompt };
         handleImageGeneration(block.id, block.data.prompt, item.aspectRatio, currentImageStyle, currentNegativePrompt);
      }
    });
    setImageStates(newImageStates);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleRetryImage = (id: string) => {
    const state = imageStates[id];
    if(state) {
      setImageStates(prev => ({...prev, [id]: {...prev[id], status: 'loading'}}));
      handleImageGeneration(id, state.prompt, aspectRatio, imageStyle, negativeImagePrompt);
    }
  }

  const handleUpdateImagePrompt = (id: string, newPrompt: string) => {
    setImageStates(prev => ({
        ...prev,
        [id]: { ...prev[id], prompt: newPrompt }
    }));
  };

  const handleDeleteHistory = (idToDelete: string) => {
    const newHistory = history.filter(item => item.id !== idToDelete);
    saveHistory(newHistory);
  };
  
  const handleSaveBrandVoice = (profile: string) => {
    setBrandVoiceProfile(profile);
    localStorage.setItem('chamkiliBrandVoice', profile);
  }

  const handleSavePersona = (persona: CustomerPersona) => {
    setCustomerPersona(persona);
    localStorage.setItem('chamkiliCustomerPersona', JSON.stringify(persona));
  }

  const handleRepurpose = async (platform: RepurposePlatform) => {
    if (contentBlocks.length === 0) return;
    setIsRepurposing(true);
    setRepurposedContent(null);
    try {
      const textContent = convertBlocksToText(contentBlocks);
      const result = await repurposeContent(textContent, platform, brandVoiceProfile, customerPersona);
      setRepurposedContent({ platform, content: result });
    } catch (err) {
      console.error("Repurposing failed", err);
    } finally {
      setIsRepurposing(false);
    }
  }

  const handleSaveShopifyCreds = (storeName: string, accessToken: string) => {
    const newCreds = { storeName, accessToken };
    setShopifyCreds(newCreds);
    localStorage.setItem('chamkiliShopifyCreds', JSON.stringify(newCreds));
    setPublishError(null);
    setPublishSuccess(null);
    setIsShopifyModalOpen(false);
  };

  const handlePublish = async () => {
    if (!selectedShopifyBlog || contentBlocks.length === 0) return;
    
    setIsPublishing(true);
    setPublishError(null);
    setPublishSuccess(null);

    try {
        const blogId = parseInt(selectedShopifyBlog, 10);
        let htmlContent = convertBlocksToHtml(contentBlocks, imageStates);
        
        const selectedMetaTitle = seoData?.metaTitles[selectedTitleIndex];
        const selectedMetaDescription = seoData?.metaDescriptions[selectedDescriptionIndex];

        if (seoData?.faq && seoData.faq.length > 0) {
            htmlContent += convertFaqToHtml(seoData.faq);
        }

        const result = await createArticle(shopifyCreds, blogId, htmlContent, selectedMetaTitle, selectedMetaDescription);
        setPublishSuccess(`Successfully published article! Shopify ID: ${result.article.id}`);
    } catch (err) {
        setPublishError(err instanceof Error ? err.message : 'An unknown error occurred during publishing.');
    } finally {
        setIsPublishing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReferenceImage({ file, preview: URL.createObjectURL(file) });
    }
  };

  const handleRemoveImage = () => {
    if (referenceImage) {
      URL.revokeObjectURL(referenceImage.preview);
      setReferenceImage(null);
    }
  };

  const handleAnalyzeCompetitor = async () => {
    if (!competitorUrl) return;
    setIsAnalyzingCompetitor(true);
    setCompetitorAnalysis(null);
    setCompetitorError(null);
    try {
      const analysis = await analyzeCompetitorUrl(competitorUrl);
      setCompetitorAnalysis(analysis);
    } catch (err) {
      setCompetitorError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsAnalyzingCompetitor(false);
    }
  };
  
  const handleAnalyzeSeoScore = async () => {
    const content = convertBlocksToText(contentBlocks);
    if (!content) return;
    setIsGeneratingSeoScore(true);
    setSeoScore(null);
    try {
      const scoreData = await getSeoScore(content, seoKeywords);
      setSeoScore(scoreData);
    } catch (err) {
        // You can add a specific error state for SEO score if needed
    } finally {
      setIsGeneratingSeoScore(false);
    }
  };

  const handleTextSelection = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isRewriting) return;
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 10) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setMagicWand({
            visible: true,
            top: rect.top + window.scrollY - 45,
            left: rect.left + window.scrollX + (rect.width / 2) - 50,
            selectedText: selection.toString(),
        });
    } else {
        setMagicWand(prev => ({ ...prev, visible: false }));
    }
  };
  
  const handleRewrite = async (instruction: RewriteInstruction) => {
    setIsRewriting(true);
    setRewrittenText(null);
    try {
        const result = await rewriteText(magicWand.selectedText, instruction);
        setRewrittenText(result);
    } catch (err) {
        setRewrittenText(`Error rewriting text: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } 
    // Don't set isRewriting false here, let the modal handle it
  };

  const closeMagicWandModals = () => {
    setIsRewriting(false);
    setRewrittenText(null);
    setMagicWand({ visible: false, top: 0, left: 0, selectedText: '' });
  };

  const handleFetchTrends = useCallback(async () => {
    setIsFetchingTrends(true);
    setTrendsError(null);
    try {
        const result = await getTrendingTopics();
        setTrendingTopics(result);
    } catch (err) {
        setTrendsError(err instanceof Error ? err.message : "Could not fetch trends.");
    } finally {
        setIsFetchingTrends(false);
    }
  }, []);

  const handleUseTrend = (topic: string) => {
    setBlogTitle(topic);
    setActivePanels(prev => prev.includes('main') ? prev : [...prev, 'main']);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateCalendar = async (goal: string, month: string) => {
    setIsGeneratingCalendar(true);
    setCalendarError(null);
    try {
        const plan = await generateContentCalendar(goal, month, customerPersona, brandVoiceProfile);
        setCalendarPlan(plan.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    } catch (err) {
        setCalendarError(err instanceof Error ? `Failed to generate calendar: ${err.message}` : 'An unknown error occurred.');
    } finally {
        setIsGeneratingCalendar(false);
    }
  };

  const handleSelectCalendarTopic = (topic: CalendarTopic) => {
    resetAll();
    setBlogTitle(topic.title);
    setSeoKeywords(topic.keywords);
    setContentTemplate(topic.contentType);
    setAppMode('blog');
    setView('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleSaveGeminiSettings = (settings: GeminiSettings) => {
    setGeminiSettings(settings);
    updateGeminiSettings(settings);
    localStorage.setItem('chamkiliGeminiSettings', JSON.stringify(settings));
  };


  const filteredHistory = useMemo(() => {
    if (!historySearchTerm.trim()) return history;
    const lowercasedFilter = historySearchTerm.toLowerCase();
    return history.filter(item => 
        item.title.toLowerCase().includes(lowercasedFilter) ||
        item.keywords.toLowerCase().includes(lowercasedFilter)
    );
  }, [history, historySearchTerm]);

  const faqHtml = useMemo(() => seoData?.faq ? convertFaqToHtml(seoData.faq) : '', [seoData]);
  const mainButtonDisabled = isGenerating || isGeneratingOutline;

  const togglePanel = (panelId: string) => {
    setActivePanels(prev => 
      prev.includes(panelId) ? prev.filter(id => id !== panelId) : [...prev, panelId]
    );
  };

  const SidebarPanel: React.FC<{id: string, title: string, icon: React.ReactNode, children: React.ReactNode}> = ({id, title, icon, children}) => {
    const isOpen = activePanels.includes(id);
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <button onClick={() => togglePanel(id)} className="w-full flex justify-between items-center p-4 text-left">
                <h3 className="text-lg font-serif font-bold text-[#C57F5D] flex items-center gap-3">{icon}{title}</h3>
                 <svg className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isOpen && <div className="p-4 pt-0">{children}</div>}
        </div>
    )
  };

  if (view === 'dashboard') {
    return (
        <div className="min-h-screen bg-[#FFFBF5] text-[#3D2C21]">
            <Header />
            <Dashboard
                onSelectTopic={handleSelectCalendarTopic}
                onGoToGenerator={() => {
                    resetAll();
                    setView('generator');
                }}
                onGenerateCalendar={handleGenerateCalendar}
                plan={calendarPlan}
                isLoading={isGeneratingCalendar}
                error={calendarError}
            />
            <footer className="text-center py-6 text-gray-500 text-sm">
                <p>Crafted with ❤️ for Chamkili</p>
            </footer>
        </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#FFFBF5] text-[#3D2C21]">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold font-serif text-[#C57F5D] mb-2">AI Content Strategist</h1>
              </div>

                <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                    <button onClick={() => { setAppMode('blog'); resetAll(); }} className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${appMode === 'blog' ? 'bg-white shadow text-[#C57F5D]' : 'text-gray-600 hover:bg-gray-200'}`}>Blog Post</button>
                    <button onClick={() => { setAppMode('campaign'); resetAll(); }} className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${appMode === 'campaign' ? 'bg-white shadow text-[#C57F5D]' : 'text-gray-600 hover:bg-gray-200'}`}>Marketing Campaign</button>
                </div>

              <div className="space-y-4">
                {appMode === 'blog' ? (
                  <div>
                    <label htmlFor={`${formId}-blogTitle`} className="block text-sm font-medium text-gray-700 mb-1">Blog Title</label>
                    <input type="text" id={`${formId}-blogTitle`} value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} placeholder="e.g., How to get rid of acne scars" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C57F5D] focus:border-[#C57F5D] transition-shadow duration-200" disabled={mainButtonDisabled} />
                  </div>
                ) : (
                   <div>
                    <label htmlFor={`${formId}-campaignGoal`} className="block text-sm font-medium text-gray-700 mb-1">Campaign Goal</label>
                    <textarea id={`${formId}-campaignGoal`} rows={3} value={campaignGoal} onChange={(e) => setCampaignGoal(e.target.value)} placeholder="e.g., Launch our new Retinol Night Cream to existing customers." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C57F5D] focus:border-[#C57F5D] transition-shadow duration-200" disabled={mainButtonDisabled} />
                  </div>
                )}
                 
                <button onClick={handleGenerateOutline} disabled={mainButtonDisabled || (appMode === 'campaign' && !campaignGoal.trim())} className="w-full flex items-center justify-center gap-2 bg-[#D18F70] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#C57F5D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C57F5D] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02]">
                  {isGeneratingOutline ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Creating Plan...</>) 
                  : (<>{appMode === 'blog' ? <SitemapIcon className="w-5 h-5" /> : <MegaphoneIcon className="w-5 h-5"/>}Generate Plan</>)}
                </button>
              </div>
            </div>
            
            <SidebarPanel id="creative" title="Creative Controls" icon={<SparkleIcon className="w-6 h-6"/>}>
               <div className="space-y-4">
                  {appMode === 'blog' && (
                    <>
                    <div>
                      <label htmlFor={`${formId}-keywords`} className="block text-sm font-medium text-gray-700 mb-1">Target SEO Keywords</label>
                      <input type="text" id={`${formId}-keywords`} value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="e.g., glowing skin, clear skin, pakistan" className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={mainButtonDisabled} />
                    </div>
                    <div>
                        <label htmlFor={`${formId}-tone`} className="block text-sm font-medium text-gray-700 mb-1">Tone of Voice</label>
                        <select id={`${formId}-tone`} value={tone} onChange={(e) => setTone(e.target.value)} disabled={mainButtonDisabled} className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em'}}>
                            {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor={`${formId}-contentTemplate`} className="block text-sm font-medium text-gray-700 mb-1">Content Template</label>
                        <select id={`${formId}-contentTemplate`} value={contentTemplate} onChange={(e) => setContentTemplate(e.target.value)} disabled={mainButtonDisabled} className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em'}}>
                            {CONTENT_TEMPLATES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor={`${formId}-authorPersona`} className="block text-sm font-medium text-gray-700 mb-1">Author Persona</label>
                        <select id={`${formId}-authorPersona`} value={authorPersona} onChange={(e) => setAuthorPersona(e.target.value)} disabled={mainButtonDisabled} className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em'}}>
                            {AUTHOR_PERSONAS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    </>
                  )}
                     <div>
                        <button onClick={() => setIsBrandVoiceModalOpen(true)} className="w-full flex items-center justify-center gap-2 text-sm text-[#C57F5D] font-semibold hover:underline mt-2">
                            <BrainCircuitIcon className="w-5 h-5" />
                            {brandVoiceProfile ? 'Edit Brand Voice Profile' : 'Set Brand Voice Profile'}
                        </button>
                    </div>
                </div>
            </SidebarPanel>

             <SidebarPanel id="persona" title="Audience Persona" icon={<UsersIcon className="w-6 h-6"/>}>
                {customerPersona ? (
                    <div className="space-y-3">
                        <div className="text-center">
                            <p className="font-bold text-lg text-gray-800">{customerPersona.name}, {customerPersona.age}</p>
                            <p className="text-sm text-gray-500">{customerPersona.occupation} from {customerPersona.location}</p>
                        </div>
                        <p className="text-xs bg-gray-50 p-2 rounded-md border text-gray-600">
                           "{customerPersona.bio}"
                        </p>
                        <button onClick={() => setIsPersonaModalOpen(true)} className="w-full text-center text-sm text-[#C57F5D] font-semibold hover:underline">
                            Edit or Change Persona
                        </button>
                    </div>
                ) : (
                    <div className="text-center space-y-3">
                        <p className="text-sm text-gray-600">No persona set. Content will target a general audience.</p>
                        <button onClick={() => setIsPersonaModalOpen(true)} className="w-full flex items-center justify-center gap-2 text-sm text-white bg-[#D18F70] hover:bg-[#C57F5D] font-semibold py-2 rounded-lg">
                            <UsersIcon className="w-5 h-5" />
                            Generate Persona
                        </button>
                    </div>
                )}
             </SidebarPanel>
            
             <SidebarPanel id="image" title="Image Controls" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label htmlFor={`${formId}-imageStyle`} className="block text-sm font-medium text-gray-700 mb-1">Visual Style</label>
                          <select id={`${formId}-imageStyle`} value={imageStyle} onChange={(e) => setImageStyle(e.target.value)} disabled={mainButtonDisabled} className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em'}}>
                              {IMAGE_STYLES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                      </div>
                      <div>
                          <label htmlFor={`${formId}-aspectRatio`} className="block text-sm font-medium text-gray-700 mb-1">Aspect Ratio</label>
                          <select id={`${formId}-aspectRatio`} value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} disabled={mainButtonDisabled} className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em'}}>
                              {Object.entries(ASPECT_RATIOS).map(([name, value]) => <option key={value} value={value}>{name}</option>)}
                          </select>
                      </div>
                  </div>
                  <div>
                    <label htmlFor={`${formId}-negativePrompt`} className="block text-sm font-medium text-gray-700 mb-1">Negative Prompt (Optional)</label>
                    <input type="text" id={`${formId}-negativePrompt`} value={negativeImagePrompt} onChange={(e) => setNegativeImagePrompt(e.target.value)} placeholder="e.g., text, blurry, cartoon" className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={mainButtonDisabled} />
                  </div>
                   <div className="pt-2">
                      <h4 className="block text-sm font-medium text-gray-700 mb-1">Reference Image (Optional)</h4>
                      {referenceImage ? (
                        <div className="relative">
                          <img src={referenceImage.preview} alt="Reference preview" className="w-full rounded-lg object-cover h-40" />
                          <button onClick={handleRemoveImage} disabled={mainButtonDisabled} className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md text-gray-500 hover:text-red-600 hover:scale-110 transition-all duration-200 disabled:opacity-50" aria-label="Remove reference image">
                            <XCircleIcon className="w-6 h-6" />
                          </button>
                        </div>
                      ) : (
                        <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadIcon className="w-8 h-8 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                            <p className="text-xs text-gray-500">PNG, JPG, or WEBP</p>
                          </div>
                          <input id="image-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} disabled={mainButtonDisabled} />
                        </label>
                      )}
                  </div>
                </div>
            </SidebarPanel>
            
             <SidebarPanel id="trends" title="Trend Spotter" icon={<TrendingUpIcon className="w-6 h-6"/>}>
                <TrendSpotter
                    onFetch={handleFetchTrends}
                    isLoading={isFetchingTrends}
                    error={trendsError}
                    result={trendingTopics}
                    onUseTopic={handleUseTrend}
                />
            </SidebarPanel>
            
            <SidebarPanel id="competitor" title="Competitor Analysis" icon={<SearchIcon className="w-6 h-6"/>}>
                <CompetitorAnalyzer 
                    url={competitorUrl}
                    setUrl={setCompetitorUrl}
                    analysis={competitorAnalysis}
                    isLoading={isAnalyzingCompetitor}
                    error={competitorError}
                    onAnalyze={handleAnalyzeCompetitor}
                />
            </SidebarPanel>

            <SidebarPanel id="seoScore" title="SEO Score" icon={<GaugeIcon className="w-6 h-6"/>}>
                <SeoScoreDisplay
                    scoreData={seoScore}
                    isLoading={isGeneratingSeoScore}
                    onAnalyze={handleAnalyzeSeoScore}
                    disabled={appState !== 'generated' || contentBlocks.length === 0}
                />
            </SidebarPanel>

            <SidebarPanel id="imageService" title="Free Image Generator" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4L5 7m14 12l-14-4" /></svg>}>
                <ImageServiceTester />
            </SidebarPanel>
            
            <SidebarPanel id="geminiSettings" title="AI Settings" icon={<SettingsIcon className="w-6 h-6"/>}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Model</label>
                        <div className="text-sm bg-gray-50 p-2 rounded border">
                            {geminiSettings.model === 'gemini-2.0-flash-exp' && 'Gemini 2.0 Flash Experimental'}
                            {geminiSettings.model === 'gemini-1.5-pro' && 'Gemini 1.5 Pro'}
                            {geminiSettings.model === 'gemini-1.5-flash' && 'Gemini 1.5 Flash'}
                            {geminiSettings.model === 'gemini-pro' && 'Gemini Pro'}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">API Key Status</label>
                        <div className="text-sm bg-gray-50 p-2 rounded border flex items-center gap-2">
                            {geminiSettings.apiKey ? (
                                <><span className="w-2 h-2 bg-green-500 rounded-full"></span>Connected</>
                            ) : (
                                <><span className="w-2 h-2 bg-red-500 rounded-full"></span>Not Set</>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => setIsSettingsModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 bg-[#D18F70] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#C57F5D] transition-colors"
                    >
                        <SettingsIcon className="w-4 h-4" />
                        Configure AI Settings
                    </button>
                </div>
            </SidebarPanel>
            
            <SidebarPanel id="shopifySettings" title="Shopify Connection" icon={<ShopifyIcon className="w-6 h-6"/>}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Store Status</label>
                        <div className="text-sm bg-gray-50 p-2 rounded border flex items-center gap-2">
                            {shopifyCreds.storeName && shopifyCreds.accessToken ? (
                                <>
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Connected to {shopifyCreds.storeName}
                                </>
                            ) : (
                                <>
                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                    Not Connected
                                </>
                            )}
                        </div>
                    </div>
                    {shopifyCreds.storeName && shopifyCreds.accessToken && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Available Blogs</label>
                            <div className="text-sm bg-gray-50 p-2 rounded border">
                                {isFetchingBlogs ? 'Loading...' : `${shopifyBlogs.length} blog(s) available`}
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setIsShopifyModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 bg-[#D18F70] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#C57F5D] transition-colors"
                    >
                        <ShopifyIcon className="w-4 h-4" />
                        {shopifyCreds.storeName && shopifyCreds.accessToken ? 'Manage Connection' : 'Connect Shopify'}
                    </button>
                </div>
            </SidebarPanel>

            {history.length > 0 && appMode === 'blog' && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-serif font-bold text-[#C57F5D] mb-4">Content Library</h2>
                 <div className="mb-4">
                    <input
                        type="search"
                        value={historySearchTerm}
                        onChange={e => setHistorySearchTerm(e.target.value)}
                        placeholder="Search by title or keywords..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C57F5D]"
                    />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {filteredHistory.map((item) => (
                    <div key={item.id} className="group flex items-center justify-between p-3 bg-gray-50 hover:bg-[#FFFBF5] rounded-lg transition-colors border border-transparent hover:border-gray-200">
                      <button onClick={() => handleHistoryClick(item)} className="text-left flex-1 truncate mr-2" title={item.title}>
                        <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                        <p className="text-xs text-gray-500 truncate">{item.keywords || 'No keywords'}</p>
                      </button>
                      <button onClick={() => handleDeleteHistory(item.id)} className="p-1.5 rounded-md text-gray-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete history item">
                          <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <button
                onClick={() => setView('dashboard')}
                className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#C57F5D] transition-colors"
            >
                <LayoutDashboardIcon className="w-5 h-5" />
                Back to Dashboard
            </button>
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
                <p><span className="font-bold">Error:</span> {error}</p>
              </div>
            )}
            
            {(appState === 'ideation') && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 min-h-[60vh] flex items-center justify-center text-center text-gray-400 p-8">
                  <div>
                    <div className="w-24 h-24 text-[#C57F5D] mx-auto mb-4 opacity-30">
                        {appMode === 'blog' ? <SitemapIcon/> : <MegaphoneIcon/>}
                    </div>
                    <p className="font-medium text-lg">Your generated content will appear here.</p>
                    <p className="text-sm">Start by entering a {appMode === 'blog' ? 'title' : 'goal'} and clicking "Generate Plan".</p>
                  </div>
                </div>
            )}

            {appState === 'outline' && outline && (
                <OutlineEditor 
                    outline={outline}
                    setOutline={setOutline}
                    onApprove={handleGenerateFullArticle}
                    onCancel={resetAll}
                    isGenerating={isGenerating}
                    onRegenerateSection={handleRegenerateSection}
                    isRegeneratingSectionId={isRegeneratingSection}
                />
            )}
            
            {appState === 'campaign_plan' && campaignPlan && (
                <CampaignPlanner
                    plan={campaignPlan}
                    onApprove={handleGenerateCampaign}
                    onCancel={resetAll}
                    isGenerating={isGenerating}
                />
            )}
            
            {appState === 'generated' && (
              <>
                 {appMode === 'blog' ? (
                     <div onMouseUp={handleTextSelection} className="bg-white rounded-2xl shadow-lg border border-gray-200 min-h-[60vh]">
                        <BlogPostDisplay
                            blocks={contentBlocks}
                            imageStates={imageStates}
                            isLoading={isGenerating}
                            onRetryImage={handleRetryImage}
                            onUpdateImagePrompt={handleUpdateImagePrompt}
                        />
                     </div>
                 ) : (
                    <CampaignDisplay 
                        blogPost={{blocks: contentBlocks, imageStates}}
                        campaignAssets={campaignAssets}
                        isLoading={isGenerating && !campaignAssets}
                        onRetryImage={handleRetryImage}
                        onUpdateImagePrompt={handleUpdateImagePrompt}
                    />
                 )}
              
                {appMode === 'blog' && (
                  <>
                    <RepurposePanel 
                      onRepurpose={handleRepurpose}
                      isRepurposing={isRepurposing}
                      result={repurposedContent}
                      onClear={() => setRepurposedContent(null)}
                    />

                    <SeoDisplay
                      isLoading={isGeneratingSeo}
                      seoData={seoData}
                      error={seoError}
                      selectedTitleIndex={selectedTitleIndex}
                      onSelectTitleIndex={setSelectedTitleIndex}
                      selectedDescriptionIndex={selectedDescriptionIndex}
                      onSelectDescriptionIndex={setSelectedDescriptionIndex}
                      faqHtml={faqHtml}
                    />
                    
                    <ShopifyDebugger />
                    
                    <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                      <h3 className="text-xl font-serif font-bold text-[#C57F5D] mb-4 flex items-center gap-3">
                        <ShopifyIcon className="w-6 h-6"/> Publish to Shopify
                      </h3>
                      {shopifyCreds.storeName && shopifyCreds.accessToken ? (
                        <div className="space-y-4">
                          {isFetchingBlogs ? ( <p className="text-sm text-gray-500">Fetching blogs...</p> ) 
                          : shopifyBlogs.length > 0 ? (
                            <div>
                              <label htmlFor="shopifyBlogSelect" className="block text-sm font-medium text-gray-700 mb-1">Select Blog</label>
                              <select id="shopifyBlogSelect" value={selectedShopifyBlog} onChange={(e) => setSelectedShopifyBlog(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isPublishing}>
                                {shopifyBlogs.map(blog => <option key={blog.id} value={blog.id}>{blog.title}</option>)}
                              </select>
                            </div>
                          ) : ( <p className="text-sm text-gray-500">No blogs found.</p> )}
                          
                          <button onClick={handlePublish} disabled={isPublishing || isFetchingBlogs || shopifyBlogs.length === 0} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                            {isPublishing ? 'Publishing...' : 'Publish Article'}
                          </button>
                          <button onClick={() => setIsShopifyModalOpen(true)} className="w-full text-center text-sm text-gray-500 hover:text-[#C57F5D] mt-2">
                            Change Shopify Settings
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-600 mb-4 text-sm">Connect your Shopify store to publish directly.</p>
                          <button onClick={() => setIsShopifyModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-[#D18F70] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#C57F5D]">
                            <ShopifyIcon className="w-5 h-5" /> Configure Shopify
                          </button>
                        </div>
                      )}
                      {publishError && <p className="mt-4 text-sm text-red-600">{publishError}</p>}
                      {publishSuccess && <p className="mt-4 text-sm text-green-600">{publishSuccess}</p>}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      
      <MagicWandMenu
        state={magicWand}
        onClose={closeMagicWandModals}
        onRewrite={handleRewrite}
        isRewriting={isRewriting}
        rewrittenText={rewrittenText}
      />
      
      <BrandVoiceModal
        isOpen={isBrandVoiceModalOpen}
        onClose={() => setIsBrandVoiceModalOpen(false)}
        onSave={handleSaveBrandVoice}
        currentProfile={brandVoiceProfile}
        analyzeFunc={analyzeBrandVoice}
        analyzeUrlFunc={analyzeBrandVoiceFromUrl}
      />

       <PersonaGenerator
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        onSave={handleSavePersona}
        currentPersona={customerPersona}
        generateFunc={generateCustomerPersona}
      />

      <ShopifyModal 
        isOpen={isShopifyModalOpen}
        onClose={() => setIsShopifyModalOpen(false)}
        onSave={handleSaveShopifyCreds}
        initialStoreName={shopifyCreds.storeName}
        initialAccessToken={shopifyCreds.accessToken}
      />
      
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={handleSaveGeminiSettings}
        currentSettings={geminiSettings}
      />
      
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Crafted with ❤️ for Chamkili</p>
      </footer>
    </div>
  );
};

export default App;