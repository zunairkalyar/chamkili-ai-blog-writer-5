import { GoogleGenerativeAI, SchemaType, GenerativeModel } from "@google/generative-ai";
import { RepurposePlatform } from "../App";
import { v4 as uuidv4 } from 'uuid';
import { fetchChamkiliBlogSitemap, getRelatedBlogLinks, generateBlogLinksHTML, getRecentBlogLinks, type BlogLink } from './sitemapService';

// Settings interface for dynamic configuration
export interface GeminiSettings {
    apiKey: string;
    model: string;
}

// Default settings
const DEFAULT_SETTINGS: GeminiSettings = {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || 
            import.meta.env.VITE_API_KEY || 
            import.meta.env.GEMINI_API_KEY || 
            'AIzaSyA1deeG3-eG3vW8KmaZ-pcnSSdj9QppZPk', // Your Gemini API key
    model: 'gemini-2.0-flash-exp'
};

// Global settings that can be updated
let currentSettings: GeminiSettings = { ...DEFAULT_SETTINGS };

// Function to update settings
export function updateGeminiSettings(settings: GeminiSettings) {
    currentSettings = { ...settings };
}

// Function to get current settings
export function getCurrentSettings(): GeminiSettings {
    return { ...currentSettings };
}

// Function to get GoogleGenerativeAI client with current settings
function getGenAI(): GoogleGenerativeAI {
    if (!currentSettings.apiKey) {
        throw new Error("API key not set. Please configure your Gemini API key in settings.");
    }
    return new GoogleGenerativeAI(currentSettings.apiKey);
}

const PRODUCT_LINKS = [
    'https://www.chamkili.com/products/vitamin-c-skin-serum',
    'https://www.chamkili.com/products/niacinamide-zinc-skin-serum'
];

interface StreamBlock {
    type: 'html' | 'image_suggestion' | 'blog_links';
    content: string;
}

interface ReferenceImage {
    data: string; // base64
    mimeType: string;
}

export interface SeoFaqData {
    metaTitles: string[];
    metaDescriptions: string[];
    faq: {
        question: string;
        answer: string;
    }[];
    keyTakeaways: string[];
}

export interface OutlineBlock {
    id: string;
    heading: string;
    keyPoints: string;
}

export interface SocialAssetPlan {
    id:string;
    type: 'twitter' | 'linkedin' | 'instagram';
    topic: string;
}

export interface EmailPlan {
    id: string;
    subject: string;
    topic: string; // The angle or goal of this specific email in the sequence
}

export interface AdPlan {
    id: string;
    headline: string;
    purpose: string; // e.g., "Top-of-funnel ad for brand awareness"
}


export interface CampaignPlan {
    blogPostOutline: OutlineBlock[];
    socialAssetPlan: SocialAssetPlan[];
    emailDripPlan: EmailPlan[];
    adCopyPlan: AdPlan[];
}


export interface CampaignAsset {
    id: string;
    type: 'twitter' | 'linkedin' | 'instagram' | 'email';
    topic: string;
    content: string;
}

export interface GeneratedEmail {
    id: string;
    subject: string;
    body: string;
}

export interface GeneratedAd {
    id: string;
    headline: string;
    body: string;
}


export interface CompetitorAnalysis {
    strengths: string[];
    weaknesses: string[];
    contentGapOpportunities: string[];
    suggestedOutline: OutlineBlock[];
}

export interface SeoScore {
    score: number;
    recommendations: string[];
}

export interface TrendingTopicSource {
    uri: string;
    title: string;
}

export interface TrendingTopic {
    topic: string;
    reason: string;
}

export interface TrendingTopicResult {
    topics: TrendingTopic[];
    sources: TrendingTopicSource[];
}

export interface CustomerPersona {
    name: string;
    age: number;
    occupation: string;
    location: string;
    skincareGoals: string[];
    painPoints: string[];
    motivations: string[];
    personality: string;
    bio: string;
}

export interface CalendarTopic {
    date: string; // "YYYY-MM-DD"
    title: string;
    keywords: string;
    contentType: string;
    notes: string;
}

// Helper function to get a simple model for text generation
function getSimpleModel(): GenerativeModel {
    const genAI = getGenAI();
    return genAI.getGenerativeModel({ 
        model: currentSettings.model,
        generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
        }
    });
}

// Helper function to get a model with JSON schema
function getJsonModel(schema: any): GenerativeModel {
    const genAI = getGenAI();
    return genAI.getGenerativeModel({
        model: currentSettings.model,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.7,
            topP: 0.9,
        }
    });
}

export async function generateBlogOutline(title: string, keywords: string, contentTemplate: string, authorPersona: string, brandVoiceProfile: string | null, persona: CustomerPersona | null): Promise<OutlineBlock[]> {
    const keywordsPrompt = keywords ? `The article should target these SEO keywords: "${keywords}".` : '';
    const brandVoicePrompt = brandVoiceProfile ? `**Brand Voice Profile:** ${brandVoiceProfile}` : '';
    const personaPrompt = persona ? `**Target Audience Persona:**\n${JSON.stringify(persona, null, 2)}\nTailor the outline to resonate with this specific person.` : '';

    const prompt = `You are a strategic content planner for Chamkili, a Pakistani skincare brand. Your persona is: "${authorPersona}".
Your task is to create a detailed blog post outline.

**Blog Topic:** "${title}"
${keywordsPrompt}
${brandVoicePrompt}
${personaPrompt}

**Instructions:**
1.  Analyze the topic, keywords, brand voice, and persona.
2.  Create a logical structure for a compelling blog post based on the "${contentTemplate}" template.
3.  The outline should consist of an introduction, several main sections (with H2 headings), and a conclusion.
4.  For each section, list the key talking points or questions to be answered.
5.  Return the response in the specified JSON format.

**JSON Response Format:**
The output must be a JSON array of objects. Each object represents a section of the blog post and must have "id", "heading", and "keyPoints" properties.
- "id": A unique string identifier.
- "heading": The proposed H2 heading for the section. For the intro/outro, use "Introduction" or "Conclusion".
- "keyPoints": A single string containing a bulleted or numbered list of key points to cover in that section. Use markdown-style lists (e.g., "- Point 1\n- Point 2").
`;

    const schema = {
        type: SchemaType.ARRAY,
        items: {
            type: SchemaType.OBJECT,
            properties: {
                id: { type: SchemaType.STRING },
                heading: { type: SchemaType.STRING },
                keyPoints: { type: SchemaType.STRING }
            },
            required: ['id', 'heading', 'keyPoints']
        }
    };

    const model = getJsonModel(schema);
    const response = await model.generateContent(prompt);
    
    const parsed = JSON.parse(response.response.text()) as Omit<OutlineBlock, 'id'>[];
    return parsed.map(item => ({...item, id: uuidv4() }));
}

export async function regenerateOutlineSection(blogTitle: string, sectionHeading: string): Promise<Pick<OutlineBlock, 'keyPoints'>> {
    const prompt = `
    You are a strategic content planner. A blog post is being created with the title "${blogTitle}".
    Your task is to generate a new set of key points for a specific section of this blog post.

    **Section Heading:** "${sectionHeading}"

    **Instructions:**
    Generate a bulleted or numbered list of key talking points for this section. The points should be insightful and directly related to the section heading and the overall blog topic.
    Return ONLY the key points in the specified JSON format.

    **JSON Response Format:**
    The output must be a JSON object with a single "keyPoints" property.
    - "keyPoints": A single string containing a markdown-style bulleted or numbered list of key points.
    `;

    const schema = {
        type: SchemaType.OBJECT,
        properties: {
            keyPoints: { type: SchemaType.STRING }
        },
        required: ['keyPoints']
    };

    const model = getJsonModel(schema);
    const response = await model.generateContent(prompt);

    return JSON.parse(response.response.text()) as Pick<OutlineBlock, 'keyPoints'>;
}

export async function* generateBlogPostStream(
    title: string, 
    tone: string, 
    keywords: string, 
    referenceImage: ReferenceImage | null, 
    contentTemplate: string, 
    authorPersona: string, 
    brandVoiceProfile: string | null, 
    outline: OutlineBlock[],
    historicalTitles: string[],
    persona: CustomerPersona | null,
    includeBlogLinks: boolean = true
    ): AsyncGenerator<StreamBlock, void, undefined> {
    
    // Fetch related blog links if requested
    let blogLinks: BlogLink[] = [];
    if (includeBlogLinks) {
        try {
            console.log('Fetching Chamkili blog links for internal linking...');
            const allBlogLinks = await fetchChamkiliBlogSitemap();
            blogLinks = getRelatedBlogLinks(title, allBlogLinks, 3);
            
            // If no related links found, get some recent ones
            if (blogLinks.length === 0) {
                blogLinks = getRecentBlogLinks(allBlogLinks, 3);
            }
            
            console.log(`Found ${blogLinks.length} blog links to include`);
        } catch (error) {
            console.error('Failed to fetch blog links:', error);
            // Continue without links if fetch fails
        }
    }
    
    const keywordsPrompt = keywords ? `Please naturally incorporate the following SEO keywords: "${keywords}".` : '';
    const imagePromptInstruction = referenceImage ? `You have been provided with a reference image. Use it as the primary source of inspiration for the blog post's tone, style, and especially for the visual descriptions in your image suggestions. The images you suggest should match the aesthetic and content of the reference image.` : '';
    const brandVoicePrompt = brandVoiceProfile ? `**Brand Voice Profile:** Adhere strictly to this voice: ${brandVoiceProfile}` : '';
    const personaPrompt = persona ? `**Target Audience Persona:** Write directly to this person:\n${JSON.stringify(persona, null, 2)}` : '**Target Audience:** Pakistani women aged 18–35.';
    const internalLinkPrompt = historicalTitles.length > 0 ? `**Internal Linking:** Here is a list of other articles on our blog: ${JSON.stringify(historicalTitles)}. If you discuss a topic covered in one of these articles, create a hyperlink to it within the text. Use natural anchor text. For the href, use a placeholder like "/blog/the-title-of-the-post-in-slug-format".` : '';

    const outlinePrompt = `**Article Outline to Follow:**
You MUST follow this exact outline. Write the content for each section based on its heading and key points.
${JSON.stringify(outline, null, 2)}
`;

    const textPrompt = `You are an expert skincare copywriter for Chamkili, a Pakistani skincare brand. Your persona is: "${authorPersona}". Your job is to write a detailed, SEO-friendly blog post based on the provided outline.

**Blog Topic:** "${title}"
${personaPrompt}
**Tone of Voice:** "${tone}"
${brandVoicePrompt}
${keywordsPrompt}
${imagePromptInstruction}
${internalLinkPrompt}
${outlinePrompt}

**Products to Feature:**
- Vitamin C Serum: ${PRODUCT_LINKS[0]}
- Niacinamide + Zinc Serum: ${PRODUCT_LINKS[1]}

**Instructions:**

1.  **Follow the Outline:** Write the full article section by section, adhering to the provided outline. The first section should contain the H1 title.
2.  **Incorporate Links:** Strategically and naturally embed the product links and internal links where they make sense. The link text should be descriptive and compelling.
3.  **Suggest Images:** As you write, identify 2-3 logical places for relevant images. For each location, create a detailed, descriptive image generation prompt.
4.  **Format as a Stream of JSON Objects:** Your entire output MUST be a stream of individual JSON objects, one per line. **DO NOT** wrap the output in a JSON array. Each JSON object must conform to one of the following structures:

    -   **For text content:**
        \`{"type": "html", "content": "<h1>...</h1>"}\`
        \`{"type": "html", "content": "<h2>...</h2><p>...</p>"}\`
        (Use only \`<h1>\`, \`<h2>\`, \`<p>\`, \`<ul>\`, \`<li>\` tags. Product links should be included inside these HTML strings as \`<a>\` tags.)

    -   **For image placeholders:**
        \`{"type": "image_suggestion", "content": "A detailed prompt for the image..."}\`
5.  **Word Count:** The final blog post should be comprehensive yet concise, aiming for a total word count of 500-700 words.`;

    try {
        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({
            model: currentSettings.model,
            generationConfig: {
                temperature: 0.6,
                topP: 0.95,
                topK: 40,
            }
        });

        const contentParts = referenceImage ? [
            {
                inlineData: { 
                    data: referenceImage.data, 
                    mimeType: referenceImage.mimeType 
                }
            },
            { text: textPrompt }
        ] : [{ text: textPrompt }];

        const streamingResult = await model.generateContentStream(contentParts);

        let buffer = '';
        for await (const chunk of streamingResult.stream) {
            buffer += chunk.text();
            let EOL; // End of line
            while ((EOL = buffer.indexOf('\n')) > -1) {
                const line = buffer.substring(0, EOL).trim();
                buffer = buffer.substring(EOL + 1);
                if (line) {
                    try { yield JSON.parse(line); } 
                    catch (e) { console.warn("Could not parse stream line as JSON, skipping:", line); }
                }
            }
        }
        if (buffer.trim()) {
             try { yield JSON.parse(buffer); } 
             catch (e) { console.warn("Could not parse final stream buffer as JSON, skipping:", buffer); }
        }

    } catch (error) {
        console.error("Error generating blog post stream:", error);
        throw new Error(`Failed to generate content from AI: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function generateSeoAndFaq(blogContentHtml: string, blogTitle: string, keywords: string): Promise<SeoFaqData> {
    const keywordsPrompt = keywords ? `The blog is targeting these SEO keywords: "${keywords}". Ensure the meta title and description align with them.` : '';
    const prompt = `
        Based on the following blog post content and title, please generate SEO metadata, a Frequently Asked Questions (FAQ) section, and a Key Takeaways section.
        **Blog Title:** "${blogTitle}"
        ${keywordsPrompt}
        **Blog Content (Plain Text):**
        ---
        ${blogContentHtml.replace(/<[^>]*>?/gm, ' ').substring(0, 4000)}
        ---
        **Instructions:**
        1.  **Meta Titles:** Create 3 compelling, distinct, and SEO-friendly meta title options. Each must be under 60 characters.
        2.  **Meta Descriptions:** Write 3 engaging and distinct meta description options for search engine results. Each should entice users to click and be under 160 characters.
        3.  **FAQ Section:** Generate 3-4 relevant "Frequently Asked Questions" with clear, concise answers based on the blog post's content.
        4.  **Key Takeaways:** Generate a list of 2-4 key takeaways from the article, presented as a simple list of strings.
        Return the response in the specified JSON format.
    `;
    
    try {
        const schema = {
            type: SchemaType.OBJECT,
            properties: {
                metaTitles: { 
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING }
                },
                metaDescriptions: { 
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING }
                },
                faq: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            question: { type: SchemaType.STRING },
                            answer: { type: SchemaType.STRING }
                        },
                        required: ['question', 'answer']
                    }
                },
                keyTakeaways: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING }
                }
            },
            required: ['metaTitles', 'metaDescriptions', 'faq', 'keyTakeaways']
        };
        
        const model = getJsonModel(schema);
        const response = await model.generateContent(prompt);

        return JSON.parse(response.response.text()) as SeoFaqData;
    } catch(error) {
        console.error("Error generating SEO & FAQ data:", error);
        throw new Error(`Failed to generate SEO data from AI: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// Import the free image generation service
import { generateFreeImage, generatePlaceholderImage } from './freeImageService';

export async function generateImage(prompt: string, aspectRatio: string, imageStyle: string, negativePrompt: string): Promise<string> {
    try {
        const freeResult = await generateFreeImage(prompt, aspectRatio, imageStyle, negativePrompt);
        
        if (freeResult.success && freeResult.imageUrl) {
            return freeResult.imageUrl;
        }
        
        console.warn('Free image generation failed:', freeResult.error);
        console.log('Falling back to placeholder image');
        return generatePlaceholderImage(prompt, aspectRatio);
        
    } catch(error) {
        console.error(`Failed to generate image for prompt: "${prompt}"`, error);
        return generatePlaceholderImage(prompt, aspectRatio);
    }
}

export async function analyzeBrandVoice(text: string): Promise<string> {
    const prompt = `Analyze the tone, style, vocabulary, and sentence structure of the following text, which represents a brand's voice.
Based on your analysis, write a short, one-paragraph description of this brand voice. This description will be used as a system instruction for an AI to generate future content that matches this voice.
The description should be clear, concise, and actionable for an AI. For example: "The brand voice is warm, knowledgeable, and slightly scientific. It uses clear, accessible language but isn't afraid to reference key ingredients. Sentences are generally short and direct. The tone is empowering and reassuring."

---
TEXT TO ANALYZE:
${text.substring(0, 4000)}
---

BRAND VOICE DESCRIPTION:`;

    const model = getSimpleModel();
    const response = await model.generateContent(prompt);
    return response.response.text();
}

export async function repurposeContent(
    blogContent: string, 
    platform: RepurposePlatform, 
    brandVoiceProfile: string | null,
    persona: CustomerPersona | null
): Promise<string> {

    const brandVoicePrompt = brandVoiceProfile ? `The post must adhere to this brand voice: ${brandVoiceProfile}` : '';
    const personaPrompt = persona ? `**Target Audience Persona:** Write directly to this person:\n${JSON.stringify(persona, null, 2)}` : '';

    let platformInstructions = '';
    switch(platform) {
        case 'twitter':
            platformInstructions = `
**Platform:** Twitter/X
**Format:** Create a compelling, numbered Twitter thread (e.g., 1/5, 2/5...).
- The first tweet must be a strong hook to grab attention.
- Each subsequent tweet should cover a key point from the article.
- Use relevant emojis and hashtags (#Skincare, #Beauty, #Pakistan).
- Keep each tweet under 280 characters.`;
            break;
        case 'linkedin':
            platformInstructions = `
**Platform:** LinkedIn
**Format:** Create a professional and insightful LinkedIn post.
- Start with a strong opening line or question.
- Use paragraphs and bullet points for readability.
- Frame the content to be valuable for a professional audience.
- End with a question to encourage discussion.
- Include 3-5 relevant hashtags (e.g., #SkincareScience #ProfessionalDevelopment #BeautyIndustry).`;
            break;
        case 'instagram':
            platformInstructions = `
**Platform:** Instagram
**Format:** Create an engaging and scannable Instagram caption.
- Start with a captivating hook line.
- Use emojis to break up text and add personality.
- Use short paragraphs and line breaks for easy reading on mobile.
- End with a clear call-to-action or a question to boost engagement.
- Provide a block of 5-10 relevant hashtags at the end, like #Chamkili #PakistaniSkincare #GlowUp #SkinLove.`;
            break;
        case 'email':
             platformInstructions = `
**Platform:** Email Newsletter
**Format:** Create a concise and compelling email newsletter summary of the blog post.
- **Subject Line:** Write an enticing subject line that creates curiosity.
- **Body:** Start with a friendly, personal greeting. Summarize the blog post's main points in a skimmable way (use short paragraphs or a bulleted list). Maintain a warm and helpful tone.
- **Call-to-Action:** End with a clear call-to-action button text that encourages readers to view the full post, for example: "Read The Full Guide".`;
            break;
    }
    
    const prompt = `You are a social media marketing expert for Chamkili, a Pakistani skincare brand.
Your task is to repurpose a blog post into engaging social media content.

${brandVoicePrompt}
${personaPrompt}
${platformInstructions}

---
ORIGINAL BLOG POST CONTENT:
${blogContent.substring(0, 5000)}
---

REPURPOSED CONTENT:
`;

    const model = getSimpleModel();
    const response = await model.generateContent(prompt);
    return response.response.text();
}

export async function generateContentCalendar(goal: string, month: string, persona: CustomerPersona | null, brandVoiceProfile: string | null): Promise<CalendarTopic[]> {
    const brandVoicePrompt = brandVoiceProfile ? `**Brand Voice Profile:** ${brandVoiceProfile}` : '';
    const personaPrompt = persona ? `**Target Audience Persona:**\n${JSON.stringify(persona, null, 2)}\nAll content in this calendar must be tailored to this specific persona.` : '';

    const prompt = `
You are a master content strategist for Chamkili, a Pakistani skincare brand.
Your task is to create a strategic content calendar for the month of **${month}**.

**Overall Goal for the Month:** "${goal}"
${brandVoicePrompt}
${personaPrompt}

**Instructions:**
1.  Generate 8-10 diverse content ideas distributed logically throughout the month.
2.  For each idea, provide:
    -   **date:** A target publish date in "YYYY-MM-DD" format within the specified month.
    -   **title:** A compelling, SEO-friendly blog post title.
    -   **keywords:** A comma-separated string of 3-5 relevant SEO keywords.
    -   **contentType:** The most suitable content type from this list: ['Standard Blog Post', 'Step-by-Step Guide', 'Product Deep Dive', 'Myth Busting'].
    -   **notes:** A brief (1-2 sentences) note on the strategic angle or hook for the post.
3.  Return the response ONLY as a JSON array of objects.

**JSON Schema:** The output must be a JSON array of objects matching the specified format.
`;

    const schema = {
        type: SchemaType.ARRAY,
        items: {
            type: SchemaType.OBJECT,
            properties: {
                date: { type: SchemaType.STRING },
                title: { type: SchemaType.STRING },
                keywords: { type: SchemaType.STRING },
                contentType: { type: SchemaType.STRING },
                notes: { type: SchemaType.STRING },
            },
            required: ['date', 'title', 'keywords', 'contentType', 'notes'],
        }
    };

    const model = getJsonModel(schema);
    const response = await model.generateContent(prompt);

    return JSON.parse(response.response.text()) as CalendarTopic[];
}

export async function generateCustomerPersona(description: string): Promise<CustomerPersona> {
    const prompt = `
You are a marketing and user research expert.
Based on the following description of a target audience, create a detailed, realistic customer persona.
The persona should be a single, fictional individual that represents the key traits of the audience.

**Target Audience Description:**
"${description}"

**Instructions:**
Generate a persona with the following attributes:
- A plausible Pakistani name.
- Age, occupation, and location (a major Pakistani city).
- Skincare goals (what they want to achieve).
- Pain points (their struggles with skincare).
- Motivations (what drives their purchasing decisions).
- A short personality summary.
- A brief bio that brings the persona to life.

Return the response in the specified JSON format.
`;

    const schema = {
        type: SchemaType.OBJECT,
        properties: {
            name: { type: SchemaType.STRING },
            age: { type: SchemaType.INTEGER },
            occupation: { type: SchemaType.STRING },
            location: { type: SchemaType.STRING },
            skincareGoals: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            painPoints: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            motivations: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            personality: { type: SchemaType.STRING },
            bio: { type: SchemaType.STRING }
        },
        required: ['name', 'age', 'occupation', 'location', 'skincareGoals', 'painPoints', 'motivations', 'personality', 'bio']
    };

    const model = getJsonModel(schema);
    const response = await model.generateContent(prompt);

    return JSON.parse(response.response.text()) as CustomerPersona;
}

// Simplified versions of other functions using the helper functions
export async function rewriteText(text: string, instruction: string): Promise<string> {
    const prompt = `
Rewrite the following text based on the provided instruction.
Return ONLY the rewritten text, with no extra commentary or markdown.

**Instruction:** "${instruction}"

**Original Text:**
---
${text}
---

**Rewritten Text:**
`;

    const model = getSimpleModel();
    const response = await model.generateContent(prompt);
    return response.response.text().trim();
}

export async function getSeoScore(htmlContent: string, keywords: string): Promise<SeoScore> {
    const prompt = `
You are an SEO expert. Analyze the following blog post content and its target keywords.
Provide an SEO score from 0 to 100 and a list of actionable recommendations for improvement.

**Target Keywords:** "${keywords}"
**Blog Content (Text):**
---
${htmlContent.replace(/<[^>]*>?/gm, ' ').substring(0, 4000)}
---

**Instructions:**
Evaluate the content based on on-page SEO best practices, including keyword density, readability, structure (assuming H1/H2 tags exist), and relevance to the keywords.
Return a JSON object with a "score" (number) and "recommendations" (an array of strings).
`;

    const schema = {
        type: SchemaType.OBJECT,
        properties: {
            score: { type: SchemaType.NUMBER },
            recommendations: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
        },
        required: ['score', 'recommendations']
    };

    const model = getJsonModel(schema);
    const response = await model.generateContent(prompt);

    return JSON.parse(response.response.text()) as SeoScore;
}

// Additional campaign and planning functions can be implemented similarly...
// I'll include a few more key ones:

export async function generateCampaignPlan(goal: string, brandVoiceProfile: string | null, persona: CustomerPersona | null): Promise<CampaignPlan> {
    const brandVoicePrompt = brandVoiceProfile ? `**Brand Voice Profile:** ${brandVoiceProfile}` : '';
    const personaPrompt = persona ? `**Target Audience Persona:**\n${JSON.stringify(persona, null, 2)}\nAll content in this campaign must be tailored to this specific persona.` : '';

    const prompt = `
You are a master marketing strategist for Chamkili, a Pakistani skincare brand.
Your task is to create a comprehensive, multi-channel marketing campaign plan based on a single goal.

**Campaign Goal:** "${goal}"
${brandVoicePrompt}
${personaPrompt}

**Instructions:**
1.  **Blog Post:** Create a detailed outline for a cornerstone blog post that supports the campaign goal.
2.  **Social Assets:** Propose a plan for social media. This should include two tweets, one LinkedIn post, and one Instagram post. For each, provide a concise topic or angle.
3.  **Email Drip Campaign:** Plan a 3-part email drip campaign. For each email, provide an enticing subject line and a topic/angle.
4.  **Ad Copy:** Plan 2-3 distinct ad copy variations. For each, provide a compelling headline and describe the ad's purpose (e.g., brand awareness, direct response).
5.  Return the response in the specified JSON format. Ensure all IDs are unique strings.
`;

    const schema = {
        type: SchemaType.OBJECT,
        properties: {
            blogPostOutline: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        id: { type: SchemaType.STRING },
                        heading: { type: SchemaType.STRING },
                        keyPoints: { type: SchemaType.STRING }
                    },
                    required: ['id', 'heading', 'keyPoints']
                }
            },
            socialAssetPlan: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        id: { type: SchemaType.STRING },
                        type: { type: SchemaType.STRING },
                        topic: { type: SchemaType.STRING }
                    },
                    required: ['id', 'type', 'topic']
                }
            },
            emailDripPlan: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        id: { type: SchemaType.STRING },
                        subject: { type: SchemaType.STRING },
                        topic: { type: SchemaType.STRING }
                    },
                    required: ['id', 'subject', 'topic']
                }
            },
            adCopyPlan: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        id: { type: SchemaType.STRING },
                        headline: { type: SchemaType.STRING },
                        purpose: { type: SchemaType.STRING }
                    },
                    required: ['id', 'headline', 'purpose']
                }
            }
        },
        required: ['blogPostOutline', 'socialAssetPlan', 'emailDripPlan', 'adCopyPlan']
    };

    const model = getJsonModel(schema);
    const response = await model.generateContent(prompt);

    const parsed = JSON.parse(response.response.text()) as CampaignPlan;
    // Ensure IDs are unique
    parsed.blogPostOutline = parsed.blogPostOutline.map(p => ({ ...p, id: uuidv4() }));
    parsed.socialAssetPlan = parsed.socialAssetPlan.map(a => ({ ...a, id: uuidv4() }));
    parsed.emailDripPlan = parsed.emailDripPlan.map(a => ({ ...a, id: uuidv4() }));
    parsed.adCopyPlan = parsed.adCopyPlan.map(a => ({ ...a, id: uuidv4() }));
    return parsed;
}

export async function generateEmailFromPlan(blogContent: string, emailPlan: EmailPlan, brandVoiceProfile: string | null, persona: CustomerPersona | null): Promise<GeneratedEmail> {
    const brandVoicePrompt = brandVoiceProfile ? `The post must adhere to this brand voice: ${brandVoiceProfile}` : '';
    const personaPrompt = persona ? `**Target Audience Persona:** Write directly to this person:\n${JSON.stringify(persona, null, 2)}` : '';
    
    const prompt = `
You are an expert email marketer for Chamkili.
Your task is to write a compelling email based on a plan, using content from a blog post as a reference.

**Email Plan:**
- Subject: "${emailPlan.subject}"
- Topic/Angle: "${emailPlan.topic}"

${brandVoicePrompt}
${personaPrompt}

**Reference Blog Post Content:**
${blogContent.substring(0, 4000)}

**Instructions:**
Write the full email body. It should be friendly, engaging, and encourage the reader to learn more. Start with a personal greeting. End with a call to action. Return ONLY the email body as a plain text string.
`;

    const model = getSimpleModel();
    const response = await model.generateContent(prompt);

    return {
        id: emailPlan.id,
        subject: emailPlan.subject,
        body: response.response.text()
    };
}

export async function generateAdFromPlan(blogContent: string, adPlan: AdPlan, brandVoiceProfile: string | null, persona: CustomerPersona | null): Promise<GeneratedAd> {
    const brandVoicePrompt = brandVoiceProfile ? `The post must adhere to this brand voice: ${brandVoiceProfile}` : '';
    const personaPrompt = persona ? `**Target Audience Persona:** Write directly to this person:\n${JSON.stringify(persona, null, 2)}` : '';
    
    const prompt = `
You are an expert performance marketer for Chamkili.
Your task is to write compelling ad copy based on a plan, using content from a blog post as a reference.

**Ad Plan:**
- Headline: "${adPlan.headline}"
- Purpose: "${adPlan.purpose}"

${brandVoicePrompt}
${personaPrompt}

**Reference Blog Post Content:**
${blogContent.substring(0, 3000)}

**Instructions:**
Write the ad body text. It should be concise, persuasive, and directly related to the headline and purpose. It needs to grab attention and drive clicks. Return ONLY the ad body text as a plain text string.
`;

    const model = getSimpleModel();
    const response = await model.generateContent(prompt);

    return {
        id: adPlan.id,
        headline: adPlan.headline,
        body: response.response.text()
    };
}

export async function getTrendingTopics(): Promise<TrendingTopicResult> {
    const prompt = `
You are a market research analyst specializing in the beauty industry.
Using Google Search, identify the top 5 trending skincare topics, ingredients, or concerns for women in Pakistan right now.
For each trend, provide a concise reason why it's trending (e.g., "viral on TikTok", "seasonal demand").

Return the response in the specified JSON format.
`;

    const schema = {
        type: SchemaType.OBJECT,
        properties: {
            trends: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        topic: { type: SchemaType.STRING },
                        reason: { type: SchemaType.STRING }
                    },
                    required: ["topic", "reason"]
                }
            }
        },
        required: ["trends"]
    };

    const model = getJsonModel(schema);
    const response = await model.generateContent(prompt);

    const parsed = JSON.parse(response.response.text()) as { trends: TrendingTopic[] };
    // Note: This simplified version doesn't include sources as they would require search grounding
    return {
        topics: parsed.trends,
        sources: []
    };
}

export async function analyzeCompetitorUrl(url: string): Promise<CompetitorAnalysis> {
    const prompt = `
You are a world-class SEO strategist and content analyst.
Analyze the article at the following URL: ${url}

**Instructions:**
Perform a detailed analysis and provide a strategic brief on how to write a better, more comprehensive article that can outrank it.
Your analysis should include:
1.  **Strengths:** What does this article do well? (e.g., good structure, clear explanations, good use of images).
2.  **Weaknesses:** Where does the article fall short? (e.g., outdated information, lacks depth, poor readability).
3.  **Content Gap Opportunities:** What important topics or questions related to the main subject does this article miss?
4.  **Suggested Outline:** Based on your analysis, provide a complete blog post outline (introduction, H2 sections with key points, conclusion) for a superior article.

Return the response in the specified JSON format.
`;

    const schema = {
        type: SchemaType.OBJECT,
        properties: {
            strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            weaknesses: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            contentGapOpportunities: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            suggestedOutline: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        id: { type: SchemaType.STRING },
                        heading: { type: SchemaType.STRING },
                        keyPoints: { type: SchemaType.STRING }
                    },
                    required: ['id', 'heading', 'keyPoints']
                }
            }
        },
        required: ['strengths', 'weaknesses', 'contentGapOpportunities', 'suggestedOutline']
    };

    const model = getJsonModel(schema);
    const response = await model.generateContent(prompt);

    const parsed = JSON.parse(response.response.text()) as CompetitorAnalysis;
    parsed.suggestedOutline = parsed.suggestedOutline.map(p => ({ ...p, id: uuidv4() }));
    return parsed;
}

export async function generateSingleCampaignAsset(blogContent: string, assetPlan: SocialAssetPlan, brandVoiceProfile: string | null, persona: CustomerPersona | null): Promise<string> {
    // This function is very similar to repurposeContent, but tailored for the campaign flow
    return repurposeContent(
        `${assetPlan.topic}\n\nKey information from the main blog post:\n${blogContent}`, 
        assetPlan.type as RepurposePlatform,
        brandVoiceProfile,
        persona,
    );
}

export async function generateCampaignEmail(blogText: string, emailPlan: EmailPlan, brandVoiceProfile: string | null, persona: CustomerPersona | null): Promise<GeneratedEmail> {
     const brandVoicePrompt = brandVoiceProfile ? `The post must adhere to this brand voice: ${brandVoiceProfile}` : '';
    const personaPrompt = persona ? `**Target Audience Persona:** Write directly to this person:\n${JSON.stringify(persona, null, 2)}` : '';

    const prompt = `You are an expert email marketer for Chamkili. Your task is to write a compelling email based on a plan, using content from a blog post as a reference.

**Email Plan:**
- Subject: "${emailPlan.subject}"
- Topic/Angle: "${emailPlan.topic}"

${brandVoicePrompt}
${personaPrompt}

**Reference Blog Post Content:**
${blogText.substring(0, 4000)}

**Instructions:** Write the full email body. It should be friendly, engaging, and encourage the reader to learn more. Start with a personal greeting (e.g., "Hi [Name],"). End with a clear call-to-action. Return ONLY the email body as a plain text string.`;

    const model = getSimpleModel();
    const response = await model.generateContent(prompt);

    return {
        id: emailPlan.id,
        subject: emailPlan.subject,
        body: response.response.text(),
    };
}

export async function generateCampaignAd(blogText: string, adPlan: AdPlan, brandVoiceProfile: string | null, persona: CustomerPersona | null): Promise<GeneratedAd> {
    const brandVoicePrompt = brandVoiceProfile ? `The post must adhere to this brand voice: ${brandVoiceProfile}` : '';
    const personaPrompt = persona ? `**Target Audience Persona:** Write directly to this person:\n${JSON.stringify(persona, null, 2)}` : '';

    const prompt = `You are a world-class performance marketer for Chamkili. Your task is to write compelling ad copy based on a plan, using content from a blog post as a reference.

**Ad Plan:**
- Headline: "${adPlan.headline}"
- Purpose: "${adPlan.purpose}"

${brandVoicePrompt}
${personaPrompt}

**Reference Blog Post Content:**
${blogText.substring(0, 3000)}

**Instructions:** Write the ad body text. It should be concise (2-3 sentences), persuasive, and directly related to the headline and purpose. It needs to grab attention and drive clicks. Return ONLY the ad body text as a plain text string.`;

    const model = getSimpleModel();
    const response = await model.generateContent(prompt);
    
    return {
        id: adPlan.id,
        headline: adPlan.headline,
        body: response.response.text(),
    };
}

export async function analyzeBrandVoiceFromUrl(url: string): Promise<string> {
    const prompt = `You are an expert brand strategist with the ability to analyze web content. I will provide you with a URL. Your task is to analyze the content on that page to understand the brand's voice.
Based on your analysis of the page's tone, style, vocabulary, and sentence structure, write a short, one-paragraph description of this brand voice. This description will be used as a system instruction for an AI to generate future content that matches this voice.
The description should be clear, concise, and actionable for an AI. For example: "The brand voice is warm, knowledgeable, and slightly scientific. It uses clear, accessible language but isn't afraid to reference key ingredients. Sentences are generally short and direct. The tone is empowering and reassuring."

---
URL TO ANALYZE:
${url}
---

BRAND VOICE DESCRIPTION:`;
    
    const model = getSimpleModel();
    const response = await model.generateContent(prompt);
    
    return response.response.text();
}
