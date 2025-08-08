import { 
  getTrendingTopics, 
  generateBlogTitleSuggestion, 
  generateBlogOutline, 
  generateBlogPostStream,
  generateSeoAndFaq,
  generateImage,
  CustomerPersona
} from './geminiService';
import { 
  getBlogs, 
  createArticle, 
  CHAMKILI_CREDENTIALS 
} from './shopifyService';

export interface AutopilotConfig {
  enabled: boolean;
  intervalMinutes: number;
  maxRetries: number;
  imageRetryDelaySeconds: number;
  persona: CustomerPersona | null;
  brandVoiceProfile: string | null;
}

export interface AutopilotStats {
  totalBlogs: number;
  successfulBlogs: number;
  failedBlogs: number;
  lastRunTime: string;
  isRunning: boolean;
  currentActivity: string;
}

class AutopilotSystem {
  private config: AutopilotConfig;
  private stats: AutopilotStats;
  private intervalId: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor() {
    this.config = {
      enabled: false,
      intervalMinutes: 10,
      maxRetries: 3,
      imageRetryDelaySeconds: 30,
      persona: null,
      brandVoiceProfile: null
    };

    this.stats = {
      totalBlogs: 0,
      successfulBlogs: 0,
      failedBlogs: 0,
      lastRunTime: 'Never',
      isRunning: false,
      currentActivity: 'Idle'
    };
  }

  // Start the autopilot system
  start(config: Partial<AutopilotConfig> = {}) {
    this.config = { ...this.config, ...config, enabled: true };
    
    if (this.intervalId) {
      this.stop();
    }

    console.log('🤖 Starting Autopilot System...');
    console.log('⏰ Interval:', this.config.intervalMinutes, 'minutes');
    
    // Run immediately, then set interval
    this.processBlogCreation();
    
    this.intervalId = setInterval(() => {
      if (!this.isProcessing) {
        this.processBlogCreation();
      } else {
        console.log('⚠️ Previous blog creation still in progress, skipping this cycle');
      }
    }, this.config.intervalMinutes * 60 * 1000);

    this.stats.isRunning = true;
    this.stats.currentActivity = 'Running - Next blog creation scheduled';
  }

  // Stop the autopilot system
  stop() {
    console.log('🛑 Stopping Autopilot System...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.config.enabled = false;
    this.stats.isRunning = false;
    this.stats.currentActivity = 'Stopped';
  }

  // Get current stats
  getStats(): AutopilotStats {
    return { ...this.stats };
  }

  // Update configuration
  updateConfig(config: Partial<AutopilotConfig>) {
    this.config = { ...this.config, ...config };
    
    if (this.config.enabled && !this.intervalId) {
      this.start();
    } else if (!this.config.enabled && this.intervalId) {
      this.stop();
    }
  }

  // Main blog creation process
  private async processBlogCreation() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    this.stats.currentActivity = 'Creating new blog...';
    this.stats.lastRunTime = new Date().toISOString();

    try {
      console.log('🚀 Starting automated blog creation cycle...');
      
      // Step 1: Get trending topics
      this.stats.currentActivity = 'Searching for trending topics...';
      console.log('🔍 Searching for trending topics...');
      
      const trendingResult = await getTrendingTopics();
      if (!trendingResult.topics || trendingResult.topics.length === 0) {
        throw new Error('No trending topics found');
      }

      const selectedTopic = trendingResult.topics[Math.floor(Math.random() * trendingResult.topics.length)];
      console.log('📈 Selected trending topic:', selectedTopic.topic);

      // Step 2: Generate blog title
      this.stats.currentActivity = 'Generating blog title...';
      console.log('✏️ Generating blog title...');
      
      const blogTitle = await generateBlogTitleSuggestion(
        selectedTopic.topic,
        'Standard Blog Post',
        'Beauty Guru',
        this.config.persona
      );
      console.log('📝 Generated title:', blogTitle);

      // Step 3: Create outline
      this.stats.currentActivity = 'Creating blog outline...';
      console.log('📋 Creating blog outline...');
      
      const outline = await generateBlogOutline(
        blogTitle,
        selectedTopic.topic,
        'Standard Blog Post',
        'Beauty Guru',
        this.config.brandVoiceProfile,
        this.config.persona
      );
      console.log('✅ Created outline with', outline.length, 'sections');

      // Step 4: Generate blog content
      this.stats.currentActivity = 'Writing blog content...';
      console.log('✍️ Writing blog content...');
      
      let blogContent = '';
      let imagePrompts: string[] = [];

      for await (const block of generateBlogPostStream(
        blogTitle,
        'Professional and Informative',
        selectedTopic.topic,
        null,
        'Standard Blog Post',
        'Beauty Guru',
        this.config.brandVoiceProfile,
        outline,
        [],
        this.config.persona,
        false
      )) {
        if (block.type === 'html') {
          blogContent += block.content;
        } else if (block.type === 'image_suggestion') {
          imagePrompts.push(block.content);
        }
      }

      console.log('📄 Generated', blogContent.length, 'characters of content');
      console.log('🖼️ Found', imagePrompts.length, 'image suggestions');

      // Step 5: Generate images with retry logic
      this.stats.currentActivity = 'Generating images...';
      const processedImages = await this.generateImagesWithRetry(imagePrompts);
      
      // Replace image placeholders with actual images
      blogContent = this.insertImagesIntoBlog(blogContent, processedImages);

      // Step 6: Generate SEO data
      this.stats.currentActivity = 'Generating SEO metadata...';
      console.log('🎯 Generating SEO metadata...');
      
      const seoData = await generateSeoAndFaq(blogContent, blogTitle, selectedTopic.topic);
      console.log('📊 Generated SEO data with', seoData.faq.length, 'FAQ items');

      // Step 7: Post to Shopify
      this.stats.currentActivity = 'Publishing to Shopify...';
      console.log('🛒 Publishing to Shopify store...');
      
      const blogs = await getBlogs(CHAMKILI_CREDENTIALS);
      const targetBlog = blogs[0]; // Use first available blog

      const article = await createArticle(
        CHAMKILI_CREDENTIALS,
        targetBlog.id,
        blogContent,
        seoData.metaTitles[0],
        seoData.metaDescriptions[0]
      );

      console.log('✅ Successfully published blog article ID:', article.article.id);
      
      // Update stats
      this.stats.totalBlogs++;
      this.stats.successfulBlogs++;
      this.stats.currentActivity = `✅ Successfully created: "${blogTitle}"`;

    } catch (error) {
      console.error('❌ Autopilot blog creation failed:', error);
      this.stats.totalBlogs++;
      this.stats.failedBlogs++;
      this.stats.currentActivity = `❌ Failed: ${error.message}`;
    } finally {
      this.isProcessing = false;
      
      // If still running, update activity for next cycle
      if (this.stats.isRunning) {
        setTimeout(() => {
          if (this.stats.isRunning) {
            this.stats.currentActivity = 'Waiting for next cycle...';
          }
        }, 5000);
      }
    }
  }

  // Generate images with retry logic
  private async generateImagesWithRetry(imagePrompts: string[]): Promise<string[]> {
    const processedImages: string[] = [];

    for (let i = 0; i < imagePrompts.length; i++) {
      const prompt = imagePrompts[i];
      let imageUrl = '';
      let attempts = 0;

      while (attempts < this.config.maxRetries && !imageUrl) {
        try {
          attempts++;
          console.log(`🖼️ Generating image ${i + 1}/${imagePrompts.length} (attempt ${attempts})...`);
          
          imageUrl = await generateImage(prompt, '16:9', 'Default', '');
          
          if (imageUrl && !imageUrl.includes('placeholder')) {
            console.log(`✅ Image ${i + 1} generated successfully`);
            processedImages.push(imageUrl);
            break;
          } else {
            throw new Error('Generated placeholder image');
          }
          
        } catch (error) {
          console.log(`⚠️ Image generation attempt ${attempts} failed:`, error.message);
          
          if (attempts < this.config.maxRetries) {
            console.log(`⏱️ Waiting ${this.config.imageRetryDelaySeconds}s before retry...`);
            await this.delay(this.config.imageRetryDelaySeconds * 1000);
          } else {
            console.log('❌ Max retries reached, using placeholder');
            processedImages.push(''); // Empty string means no image
          }
        }
      }
    }

    return processedImages;
  }

  // Insert generated images into blog content
  private insertImagesIntoBlog(blogContent: string, images: string[]): string {
    let imageIndex = 0;
    
    // Find image suggestion comments and replace with actual images
    return blogContent.replace(/<!-- IMAGE_SUGGESTION: (.*?) -->/g, (match, prompt) => {
      if (imageIndex < images.length && images[imageIndex]) {
        const imageHtml = `<img src="${images[imageIndex]}" alt="${prompt.substring(0, 100)}" style="width: 100%; max-width: 600px; height: auto; margin: 20px 0; border-radius: 8px;">`;
        imageIndex++;
        return imageHtml;
      }
      imageIndex++;
      return ''; // Remove placeholder if no image available
    });
  }

  // Utility function for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const autopilotSystem = new AutopilotSystem();

// Export types and functions
export type { AutopilotConfig, AutopilotStats };
export { AutopilotSystem };
