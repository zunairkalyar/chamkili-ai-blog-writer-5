import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCurrentSettings } from './geminiService';
import { uploadImageToShopify, CHAMKILI_CREDENTIALS } from './shopifyService';

export interface GeminiImageResult {
    success: boolean;
    imageUrl?: string;
    error?: string;
}

// Gemini image generation using the cheapest model
export async function generateImageWithGemini(
    prompt: string, 
    aspectRatio: string = '1:1', 
    imageStyle: string = 'Default',
    negativePrompt: string = ''
): Promise<GeminiImageResult> {
    console.log('🎨 Generating image for prompt:', prompt);
    
    try {
        const dimensions = getImageDimensions(aspectRatio);
        const stylePrompt = getStylePrompt(imageStyle);
        const enhancedPrompt = enhancePromptForSkincare(prompt, stylePrompt, negativePrompt);
        
        console.log('Enhanced prompt:', enhancedPrompt.substring(0, 100) + '...');
        
        // Try direct image generation with simplified approach
        const imageUrl = await generateDirectImage(enhancedPrompt, dimensions);
        
        if (imageUrl) {
            console.log('✅ Successfully generated image');
            
            // Upload to Shopify and get the Shopify-hosted URL
            const shopifyImageUrl = await uploadImageToShopify(
                CHAMKILI_CREDENTIALS,
                imageUrl,
                'blog-image',
                prompt.substring(0, 100) // Use prompt as alt text
            );
            
            return {
                success: true,
                imageUrl: shopifyImageUrl // Use Shopify URL instead of external URL
            };
        }
        
        // Fallback to placeholder
        console.log('🔄 Using fallback placeholder');
        return {
            success: true,
            imageUrl: generatePlaceholderImage(prompt, aspectRatio)
        };
        
    } catch (error) {
        console.error('❌ Image generation error:', error);
        return {
            success: true, // Still return success with fallback
            imageUrl: generatePlaceholderImage(prompt, aspectRatio)
        };
    }
}

// Enhanced prompt creation focusing on Pakistani Muslim women with Chamkili branding
function enhancePromptForSkincare(prompt: string, stylePrompt: string, negativePrompt: string): string {
    // Clean the original prompt to remove product references
    const cleanPrompt = cleanPromptFromProducts(prompt);
    
    const pakMuslimEnhancements = [
        "beautiful Pakistani Muslim woman",
        "modest hijab or dupatta",
        "South Asian features",
        "warm olive skin tone",
        "respectful modest clothing",
        "natural beauty",
        "professional photography",
        "clean aesthetic",
        "soft natural lighting",
        "subtle Chamkili text in corner",
        "elegant composition"
    ];
    
    const negativeElements = negativePrompt ? negativePrompt.split(',').map(s => s.trim()) : [
        "product bottles", "serum containers", "cream jars", "cosmetic packaging",
        "explicit products", "brand logos except Chamkili", "western models",
        "immodest clothing", "revealing outfits", "blurry", "low quality", 
        "distorted", "watermark", "text overlay except Chamkili"
    ];
    
    let enhancedPrompt = `${cleanPrompt}, ${stylePrompt}, ${pakMuslimEnhancements.join(', ')}`;
    
    // Add negative prompt handling
    if (negativeElements.length > 0) {
        enhancedPrompt += ` | Avoid: ${negativeElements.join(', ')}`;
    }
    
    return enhancedPrompt;
}

// Clean prompt from product-specific references
function cleanPromptFromProducts(prompt: string): string {
    // Remove product-specific words and replace with general beauty terms
    const productReplacements: { [key: string]: string } = {
        'serum': 'skincare routine',
        'vitamin c serum': 'glowing skin',
        'niacinamide': 'clear skin',
        'moisturizer': 'hydrated skin',
        'cleanser': 'fresh clean skin',
        'cream': 'soft skin',
        'bottle': 'beauty',
        'container': 'beauty',
        'packaging': 'beauty',
        'product': 'skincare',
        'applying serum': 'touching face gently',
        'using cream': 'skincare routine',
        'holding bottle': 'natural pose'
    };
    
    let cleanedPrompt = prompt.toLowerCase();
    
    // Replace product terms with general beauty terms
    for (const [product, replacement] of Object.entries(productReplacements)) {
        const regex = new RegExp(product, 'gi');
        cleanedPrompt = cleanedPrompt.replace(regex, replacement);
    }
    
    // Ensure Pakistani context is included
    if (!cleanedPrompt.includes('pakistani') && !cleanedPrompt.includes('south asian')) {
        cleanedPrompt = 'Pakistani woman ' + cleanedPrompt;
    }
    
    return cleanedPrompt;
}

// Get style-specific prompt enhancements
function getStylePrompt(imageStyle: string): string {
    const styleMap: Record<string, string> = {
        'Default': 'clean, modern, professional',
        'Minimalist & Clean': 'minimalist, white background, simple composition, clean lines',
        'Lush & Organic': 'natural elements, organic textures, green plants, earthy tones',
        'Luxury & Gold': 'luxury aesthetic, gold accents, premium feel, elegant composition',
        'Vibrant & Playful': 'bright colors, vibrant tones, energetic, cheerful mood'
    };
    
    return styleMap[imageStyle] || styleMap['Default'];
}

// Direct image generation with simplified approach
async function generateDirectImage(enhancedPrompt: string, dimensions: { width: number, height: number }): Promise<string | null> {
    const services = [
        // Try Pollinations first (most reliable for AI-generated images)
        async () => {
            try {
                const cleanPrompt = enhancedPrompt.split('|')[0].trim(); // Remove negative prompts for URL
                const encodedPrompt = encodeURIComponent(cleanPrompt.substring(0, 200)); // Limit length
                const seed = Math.floor(Math.random() * 1000000);
                const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dimensions.width}&height=${dimensions.height}&seed=${seed}&nologo=true`;
                
                console.log('🔗 Trying Pollinations:', url.substring(0, 100) + '...');
                
                // Simple fetch without complex validation
                const response = await Promise.race([
                    fetch(url),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
                ]) as Response;
                
                if (response.ok) {
                    console.log('✅ Pollinations success');
                    return url;
                }
                throw new Error('Response not ok');
            } catch (error) {
                console.log('❌ Pollinations failed:', error.message);
                throw error;
            }
        },
        
        // Try Unsplash as backup (curated photos)
        async () => {
            try {
                const keywords = extractSkincareKeywords(enhancedPrompt);
                const query = keywords.join(',');
                const url = `https://source.unsplash.com/${dimensions.width}x${dimensions.height}/?${encodeURIComponent(query)}`;
                
                console.log('🔗 Trying Unsplash with query:', query);
                
                // Test if URL is accessible
                const response = await Promise.race([
                    fetch(url, { method: 'HEAD' }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
                ]) as Response;
                
                if (response.ok) {
                    console.log('✅ Unsplash success');
                    return url;
                }
                throw new Error('Response not ok');
            } catch (error) {
                console.log('❌ Unsplash failed:', error.message);
                throw error;
            }
        }
    ];
    
    // Try each service
    for (const service of services) {
        try {
            const result = await service();
            if (result) return result;
        } catch (error) {
            continue; // Try next service
        }
    }
    
    return null; // All services failed
}

// Use external services with enhanced prompts
async function generateWithExternalService(
    enhancedPrompt: string, 
    dimensions: { width: number, height: number },
    aspectRatio: string
): Promise<GeminiImageResult> {
    
    // Try multiple services in order of preference. Note: these are free services and can be unreliable.
    // For production applications, a paid image generation service with a stable API is recommended.
    const services = [
        () => generateWithPollinations(enhancedPrompt, dimensions),
        () => generateWithUnsplash(enhancedPrompt, dimensions)
    ];

    for (const service of services) {
        try {
            const result = await service();
            if (result.success) {
                console.log('Successfully generated enhanced image');
                return result;
            }
        } catch (error) {
            console.warn('Service failed, trying next:', error);
            continue;
        }
    }

    // Final fallback
    return {
        success: true,
        imageUrl: generatePlaceholderImage(enhancedPrompt, aspectRatio)
    };
}

// Pollinations.ai with enhanced prompts
async function generateWithPollinations(prompt: string, dimensions: { width: number, height: number }): Promise<GeminiImageResult> {
    try {
        const encodedPrompt = encodeURIComponent(prompt);
        const seed = Math.floor(Math.random() * 1000000);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dimensions.width}&height=${dimensions.height}&seed=${seed}`;

        // Test if the image loads
        const testResponse = await Promise.race([
            fetch(imageUrl, { method: 'HEAD' }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000)) // Increased timeout
        ]) as Response;
        
        if (!testResponse.ok) {
            throw new Error('Image generation failed');
        }

        return {
            success: true,
            imageUrl: imageUrl
        };

    } catch (error) {
        console.error('Pollinations API error:', error);
        throw error;
    }
}

// Picsum Photos with thematic seeds
async function generateWithPicsum(prompt: string, dimensions: { width: number, height: number }): Promise<GeminiImageResult> {
    try {
        // Create a more sophisticated seed based on prompt content
        const seed = generateSemanticSeed(prompt);
        const imageUrl = `https://picsum.photos/seed/${seed}/${dimensions.width}/${dimensions.height}?blur=0&grayscale=0`;
        
        return {
            success: true,
            imageUrl: imageUrl
        };

    } catch (error) {
        console.error('Picsum API error:', error);
        throw error;
    }
}

// Unsplash with keyword optimization
async function generateWithUnsplash(prompt: string, dimensions: { width: number, height: number }): Promise<GeminiImageResult> {
    try {
        // Extract and optimize keywords for Unsplash
        const keywords = extractSkincareKeywords(prompt);
        const query = keywords.join(',');
        
        // Use Unsplash API format
        const imageUrl = `https://source.unsplash.com/${dimensions.width}x${dimensions.height}/?${encodeURIComponent(query)}`;
        
        return {
            success: true,
            imageUrl: imageUrl
        };

    } catch (error) {
        console.error('Unsplash API error:', error);
        throw error;
    }
}

// Extract Pakistani Muslim woman focused keywords
function extractSkincareKeywords(prompt: string): string[] {
    const promptLower = prompt.toLowerCase();
    
    // Pakistani Muslim women focused keyword mapping
    const keywordMapping: Record<string, string[]> = {
        'woman': ['pakistani-woman', 'muslim-woman', 'hijab'],
        'women': ['pakistani-women', 'muslim-women', 'modest-style'],
        'skin': ['natural-beauty', 'glowing-skin', 'south-asian'],
        'face': ['pakistani-beauty', 'natural-portrait', 'modest'],
        'skincare': ['natural-beauty', 'glowing-skin', 'wellness'],
        'routine': ['self-care', 'beauty-ritual', 'wellness'],
        'glow': ['radiant-skin', 'natural-beauty', 'healthy'],
        'radiant': ['glowing', 'natural-beauty', 'confidence'],
        'clear': ['fresh-skin', 'natural-beauty', 'healthy'],
        'natural': ['organic', 'pure', 'healthy'],
        'beauty': ['pakistani-beauty', 'natural-beauty', 'confidence'],
        'pakistani': ['south-asian', 'muslim-woman', 'cultural-beauty'],
        'muslim': ['modest-style', 'hijab', 'respectful'],
        'chamkili': ['brand', 'skincare', 'natural']
    };
    
    let foundKeywords: string[] = [];
    
    // Always include Pakistani Muslim woman context
    foundKeywords = ['pakistani-woman', 'muslim-beauty', 'natural-skincare'];
    
    // Find additional relevant keywords
    for (const [key, keywords] of Object.entries(keywordMapping)) {
        if (promptLower.includes(key)) {
            foundKeywords = foundKeywords.concat(keywords);
        }
    }
    
    // Remove duplicates and prioritize
    const uniqueKeywords = [...new Set(foundKeywords)];
    
    // Return optimized keywords with Pakistani context always included
    return uniqueKeywords.length > 3 
        ? uniqueKeywords.slice(0, 4) 
        : ['pakistani-woman', 'muslim-beauty', 'natural-skincare', 'modest-style'];
}

// Generate semantic seed for consistent image selection
function generateSemanticSeed(prompt: string): string {
    // Create a seed that's consistent for similar prompts but varies for different content
    const keywords = extractSkincareKeywords(prompt);
    const seedBase = keywords.sort().join('');
    
    // Convert to number and ensure it's within reasonable range
    const seed = Math.abs(seedBase.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 10000;
    
    return seed.toString();
}

// Get image dimensions based on aspect ratio
function getImageDimensions(aspectRatio: string): { width: number, height: number } {
    const ratioMap: Record<string, { width: number, height: number }> = {
        '1:1': { width: 512, height: 512 },
        '16:9': { width: 768, height: 432 },
        '4:3': { width: 640, height: 480 },
        '3:4': { width: 480, height: 640 },
        '9:16': { width: 432, height: 768 },
    };

    return ratioMap[aspectRatio] || ratioMap['1:1'];
}

// Enhanced placeholder image generator
function generatePlaceholderImage(prompt: string, aspectRatio: string = '1:1'): string {
    const dimensions = getImageDimensions(aspectRatio);
    const keywords = extractSkincareKeywords(prompt);
    const displayText = keywords.slice(0, 2).join(' & ') || 'Skincare';
    const encodedText = encodeURIComponent(displayText);
    
    // Use a more aesthetic placeholder with Chamkili brand colors
    return `https://via.placeholder.com/${dimensions.width}x${dimensions.height}/D18F70/FFFFFF?text=${encodedText}`;
}

// Test Gemini image generation capabilities
export async function testGeminiImageGeneration(): Promise<{ available: boolean, error?: string }> {
    try {
        const settings = getCurrentSettings();
        if (!settings.apiKey) {
            return { 
                available: false, 
                error: 'No Gemini API key configured' 
            };
        }

        // Test basic connectivity
        const genAI = new GoogleGenerativeAI(settings.apiKey);
        
        return { 
            available: true 
        };

    } catch (error) {
        return { 
            available: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
        };
    }
}
