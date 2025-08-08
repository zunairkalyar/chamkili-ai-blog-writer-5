const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = require('node-fetch');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

// Load configuration
let config;
try {
    const configPath = path.join(__dirname, 'config.json');
    const configData = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(configData);
    console.log('✅ Configuration loaded successfully');
} catch (error) {
    console.error('❌ Error loading config.json:', error.message);
    console.log('Using default configuration...');
    config = {
        schedule: { interval: "*/10 * * * *" },
        gemini: { apiKey: process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY', model: 'gemini-2.0-flash-exp' },
        shopify: { storeName: process.env.SHOPIFY_STORE_NAME || 'YOUR_STORE_NAME', accessToken: process.env.SHOPIFY_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN' },
        blogSettings: {
            topics: ["Best Korean Skincare Routine for Pakistani Skin"],
            tones: ['Warm & Friendly'],
            contentTemplates: ['Standard Blog Post'],
            authorPersonas: ['Beauty Guru'],
            keywords: ["skincare routine Pakistan"]
        }
    };
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

class AutoBlogPoster {
    constructor() {
        this.genAI = genAI;
        this.isProcessing = false;
    }

    // Get random element from array
    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    // Generate random blog configuration
    getRandomBlogConfig() {
        return {
            title: this.getRandomElement(config.blogSettings.topics),
            tone: this.getRandomElement(config.blogSettings.tones),
            contentTemplate: this.getRandomElement(config.blogSettings.contentTemplates),
            authorPersona: this.getRandomElement(config.blogSettings.authorPersonas),
            keywords: this.generateKeywords()
        };
    }

    // Generate relevant keywords based on topic
    generateKeywords() {
        const availableKeywords = config.blogSettings.keywords;
        
        // Pick 2-3 random keywords
        const selectedKeywords = [];
        for (let i = 0; i < Math.min(3, availableKeywords.length); i++) {
            const keyword = this.getRandomElement(availableKeywords);
            if (!selectedKeywords.includes(keyword)) {
                selectedKeywords.push(keyword);
            }
        }
        
        return selectedKeywords.join(', ');
    }

    // Generate blog outline using Gemini AI
    async generateBlogOutline(config) {
        console.log('Generating blog outline for:', config.title);
        
        const prompt = `You are a strategic content planner for Chamkili, a Pakistani skincare brand. Your persona is: "${config.authorPersona}".
Your task is to create a detailed blog post outline.

**Blog Topic:** "${config.title}"
The article should target these SEO keywords: "${config.keywords}".

**Instructions:**
1. Create a logical structure for a compelling blog post based on the "${config.contentTemplate}" template.
2. The outline should consist of an introduction, several main sections (with H2 headings), and a conclusion.
3. For each section, list the key talking points or questions to be answered.

Return a JSON array of objects with "id", "heading", and "keyPoints" properties.`;

        try {
            const model = this.genAI.getGenerativeModel({ 
                model: config.gemini.model,
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.9,
                    topK: 40,
                }
            });

            const result = await model.generateContent(prompt);
            const text = result.response.text();
            
            // Extract JSON from response
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Could not extract JSON from outline response');
            }
        } catch (error) {
            console.error('Error generating outline:', error);
            // Return a basic outline as fallback
            return [
                { id: "intro", heading: "Introduction", keyPoints: "- Hook the reader\n- Introduce the topic\n- Preview main points" },
                { id: "main1", heading: "Understanding the Basics", keyPoints: "- Define key concepts\n- Explain importance" },
                { id: "main2", heading: "Step-by-Step Guide", keyPoints: "- Detailed instructions\n- Tips and tricks" },
                { id: "conclusion", heading: "Conclusion", keyPoints: "- Summarize key points\n- Call to action" }
            ];
        }
    }

    // Generate full blog content
    async generateFullBlog(config, outline) {
        console.log('Generating full blog content...');
        
        const prompt = `You are ${config.authorPersona} writing for Chamkili, a Pakistani skincare brand.
Write a comprehensive blog post with the following structure:

**Title:** ${config.title}
**Tone:** ${config.tone}
**Keywords to include:** ${config.keywords}

**Outline:**
${outline.map(section => `${section.heading}: ${section.keyPoints}`).join('\n\n')}

**Instructions:**
1. Write engaging, informative content that resonates with Pakistani skincare enthusiasts
2. Include practical tips and actionable advice
3. Naturally incorporate the target keywords
4. Use ${config.tone} tone throughout
5. Include relevant product mentions for Chamkili skincare products
6. Make it SEO-friendly with proper headings (H1, H2, H3)
7. Add a compelling introduction and strong conclusion with call-to-action

Write the complete blog post in HTML format, starting with an H1 title tag.`;

        try {
            const model = this.genAI.getGenerativeModel({ 
                model: config.gemini.model,
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.9,
                    topK: 40,
                }
            });

            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error('Error generating blog content:', error);
            throw error;
        }
    }

    // Generate SEO metadata
    async generateSeoMetadata(content, title, keywords) {
        console.log('Generating SEO metadata...');
        
        const prompt = `Generate SEO metadata for this blog post:

**Title:** ${title}
**Keywords:** ${keywords}
**Content Preview:** ${content.substring(0, 500)}...

Generate:
1. 3 meta title variations (50-60 characters each)
2. 3 meta description variations (150-160 characters each)

Return as JSON with "metaTitles" and "metaDescriptions" arrays.`;

        try {
            const model = this.genAI.getGenerativeModel({ 
                model: config.gemini.model,
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.9,
                    topK: 40,
                }
            });

            const result = await model.generateContent(prompt);
            const text = result.response.text();
            
            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const seoData = JSON.parse(jsonMatch[0]);
                return {
                    metaTitle: seoData.metaTitles?.[0] || title,
                    metaDescription: seoData.metaDescriptions?.[0] || `Learn about ${title.toLowerCase()} with expert tips and advice from Chamkili skincare experts.`
                };
            }
        } catch (error) {
            console.error('Error generating SEO metadata:', error);
        }

        return {
            metaTitle: title,
            metaDescription: `Learn about ${title.toLowerCase()} with expert tips and advice from Chamkili skincare experts.`
        };
    }

    // Shopify API helper
    async shopifyFetch(endpoint, method = 'GET', body = null) {
        const url = `https://${config.shopify.storeName}.myshopify.com/admin/api/2024-07/${endpoint}`;
        
        const options = {
            method,
            headers: {
                'X-Shopify-Access-Token': config.shopify.accessToken,
                'Content-Type': 'application/json',
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Shopify API Error (${response.status}): ${errorText}`);
        }

        return await response.json();
    }

    // Get or create a blog on Shopify
    async getShopifyBlog() {
        try {
            const blogsResponse = await this.shopifyFetch('blogs.json');
            
            if (blogsResponse.blogs && blogsResponse.blogs.length > 0) {
                return blogsResponse.blogs[0]; // Use first available blog
            }

            // Create a new blog if none exists
            console.log('No blogs found, creating new blog...');
            const newBlogResponse = await this.shopifyFetch('blogs.json', 'POST', {
                blog: {
                    title: 'Chamkili Beauty Blog',
                    handle: 'chamkili-beauty-blog'
                }
            });

            return newBlogResponse.blog;
        } catch (error) {
            console.error('Error getting Shopify blog:', error);
            throw error;
        }
    }

    // Publish article to Shopify
    async publishToShopify(content, metaTitle, metaDescription) {
        console.log('Publishing to Shopify...');
        
        try {
            const blog = await this.getShopifyBlog();
            
            // Extract title from content
            const tempDiv = { innerHTML: content };
            const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
            const articleTitle = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '') : 'New Skincare Article';
            
            // Remove h1 from content body
            const articleBody = content.replace(/<h1[^>]*>.*?<\/h1>/i, '');

            const articleData = {
                article: {
                    title: articleTitle,
                    author: 'Chamkili AI Writer',
                    body_html: articleBody,
                    published: true,
                    metafields: [
                        {
                            key: 'title_tag',
                            namespace: 'global',
                            value: metaTitle,
                            type: 'single_line_text_field'
                        },
                        {
                            key: 'description_tag',
                            namespace: 'global',
                            value: metaDescription,
                            type: 'single_line_text_field'
                        }
                    ]
                }
            };

            const response = await this.shopifyFetch(`blogs/${blog.id}/articles.json`, 'POST', articleData);
            
            console.log(`✅ Article published successfully! Shopify ID: ${response.article.id}`);
            return response.article;
        } catch (error) {
            console.error('Error publishing to Shopify:', error);
            throw error;
        }
    }

    // Main function to generate and publish a blog
    async generateAndPublishBlog() {
        if (this.isProcessing) {
            console.log('⏳ Already processing a blog, skipping this cycle...');
            return;
        }

        this.isProcessing = true;
        console.log('\n🚀 Starting automatic blog generation...');
        
        try {
            // 1. Generate random blog configuration
            const config = this.getRandomBlogConfig();
            console.log('📝 Blog config:', config);

            // 2. Generate outline
            const outline = await this.generateBlogOutline(config);
            
            // 3. Generate full content
            const content = await this.generateFullBlog(config, outline);
            
            // 4. Generate SEO metadata
            const seoData = await this.generateSeoMetadata(content, config.title, config.keywords);
            
            // 5. Publish to Shopify
            await this.publishToShopify(content, seoData.metaTitle, seoData.metaDescription);
            
            console.log('✨ Blog generation and publishing completed successfully!');
            
        } catch (error) {
            console.error('❌ Error in blog generation process:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    // Start the automatic posting service
    start() {
        console.log('🤖 Chamkili Auto Blog Poster starting...');
        console.log(`📅 Schedule: ${config.schedule.description || config.schedule.interval}`);
        console.log(`🎯 Blog Topics: ${config.blogSettings.topics.length} topics available`);
        console.log(`🤖 AI Model: ${config.gemini.model}`);
        console.log(`🏪 Shopify Store: ${config.shopify.storeName}`);
        
        // Generate first blog immediately
        this.generateAndPublishBlog();
        
        // Schedule to run based on config
        cron.schedule(config.schedule.interval, () => {
            console.log(`\n⏰ [${new Date().toLocaleString()}] Time to generate new blog!`);
            this.generateAndPublishBlog();
        });
        
        console.log('✅ Auto-poster is now running! Press Ctrl+C to stop.');
    }

    // Stop the service gracefully
    stop() {
        console.log('🛑 Auto Blog Poster stopped.');
        process.exit(0);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
    process.exit(0);
});

// Start the auto-poster
const autoPoster = new AutoBlogPoster();
autoPoster.start();
