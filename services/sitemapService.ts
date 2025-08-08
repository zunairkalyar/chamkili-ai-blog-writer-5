export interface BlogLink {
  url: string;
  title: string;
  lastModified: string;
  imageUrl?: string;
}

export interface ParsedSitemap {
  blogLinks: BlogLink[];
  lastFetched: string;
}

// Cache for sitemap data
let cachedSitemap: ParsedSitemap | null = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const fetchChamkiliBlogSitemap = async (): Promise<BlogLink[]> => {
  // Check if we have valid cached data
  if (cachedSitemap) {
    const cacheAge = Date.now() - new Date(cachedSitemap.lastFetched).getTime();
    if (cacheAge < CACHE_DURATION) {
      console.log('Using cached sitemap data');
      return cachedSitemap.blogLinks;
    }
  }

  try {
    console.log('Fetching fresh sitemap data from Chamkili...');
    const response = await fetch('https://www.chamkili.com/sitemap_blogs_1.xml');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.status}`);
    }
    
    const xmlText = await response.text();
    const blogLinks = parseSitemapXML(xmlText);
    
    // Cache the results
    cachedSitemap = {
      blogLinks,
      lastFetched: new Date().toISOString()
    };
    
    console.log(`Fetched ${blogLinks.length} blog links from sitemap`);
    return blogLinks;
  } catch (error) {
    console.error('Failed to fetch blog sitemap:', error);
    
    // Return cached data if available, even if expired
    if (cachedSitemap) {
      console.log('Using expired cache due to fetch error');
      return cachedSitemap.blogLinks;
    }
    
    // Return empty array as fallback
    return [];
  }
};

const parseSitemapXML = (xmlText: string): BlogLink[] => {
  const blogLinks: BlogLink[] = [];
  
  try {
    // Parse the XML manually since we can't rely on DOMParser in all environments
    const urlMatches = xmlText.match(/<url>([\s\S]*?)<\/url>/g);
    
    if (!urlMatches) {
      console.warn('No URL entries found in sitemap');
      return [];
    }
    
    for (const urlMatch of urlMatches) {
      const locMatch = urlMatch.match(/<loc>(https:\/\/www\.chamkili\.com\/blogs\/[^<]+)<\/loc>/);
      const lastmodMatch = urlMatch.match(/<lastmod>([^<]+)<\/lastmod>/);
      
      if (locMatch) {
        const url = locMatch[1];
        const lastModified = lastmodMatch ? lastmodMatch[1] : '';
        
        // Skip the main blog category pages
        if (url.match(/\/blogs\/[^\/]+$/)) {
          continue;
        }
        
        // Extract title from URL (fallback)
        let title = url.split('/').pop() || '';
        title = title.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Look for image URL in the content
        const imageMatch = urlMatch.match(/<image:loc>([^<]+)<\/image:loc>/);
        const imageUrl = imageMatch ? imageMatch[1] : undefined;
        
        // Try to extract title from the XML content if available
        const titleLines = xmlText.split('\n');
        const urlIndex = titleLines.findIndex(line => line.includes(url));
        if (urlIndex !== -1) {
          // Look for title in nearby lines
          for (let i = Math.max(0, urlIndex - 3); i <= Math.min(titleLines.length - 1, urlIndex + 3); i++) {
            const line = titleLines[i].trim();
            if (line && !line.startsWith('<') && !line.includes('http') && line.length > 10) {
              // This might be a title
              if (!line.includes('.com') && !line.includes('weekly') && !line.includes('2025-')) {
                title = line;
                break;
              }
            }
          }
        }
        
        blogLinks.push({
          url,
          title: title.trim() || 'Chamkili Blog Post',
          lastModified,
          imageUrl
        });
      }
    }
    
    // Sort by last modified date (newest first)
    blogLinks.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
    
  } catch (error) {
    console.error('Error parsing sitemap XML:', error);
  }
  
  return blogLinks;
};

export const getRelatedBlogLinks = (currentTitle: string, allLinks: BlogLink[], count: number = 3): BlogLink[] => {
  if (allLinks.length === 0) return [];
  
  const currentTitleWords = currentTitle.toLowerCase().split(/\s+/);
  
  // Score each blog link based on title similarity
  const scoredLinks = allLinks.map(link => {
    const linkTitleWords = link.title.toLowerCase().split(/\s+/);
    let score = 0;
    
    // Check for common words
    for (const word of currentTitleWords) {
      if (word.length > 3 && linkTitleWords.some(linkWord => linkWord.includes(word) || word.includes(linkWord))) {
        score += 1;
      }
    }
    
    // Bonus for skincare-related terms
    const skincareTerms = ['skincare', 'skin', 'beauty', 'glow', 'routine', 'care', 'acne', 'moisturizer'];
    for (const term of skincareTerms) {
      if (link.title.toLowerCase().includes(term) && currentTitle.toLowerCase().includes(term)) {
        score += 0.5;
      }
    }
    
    return { ...link, score };
  });
  
  // Sort by score (highest first) and take the top results
  return scoredLinks
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ score, ...link }) => link);
};

export const generateBlogLinksHTML = (relatedLinks: BlogLink[]): string => {
  if (relatedLinks.length === 0) return '';
  
  const linksHTML = relatedLinks.map(link => {
    const displayTitle = link.title.length > 60 ? link.title.substring(0, 60) + '...' : link.title;
    return `<li><a href="${link.url}" style="color: #C57F5D; text-decoration: none; font-weight: 500;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${displayTitle}</a></li>`;
  }).join('\n    ');
  
  return `
<div style="background-color: #FFFBF5; border: 2px solid #F5E6D3; border-radius: 12px; padding: 20px; margin: 24px 0;">
  <h3 style="color: #C57F5D; font-size: 18px; font-weight: bold; margin: 0 0 12px 0; font-family: Georgia, serif;">
    🌟 You Might Also Love These Chamkili Guides
  </h3>
  <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
    ${linksHTML}
  </ul>
</div>`;
};

// Get a random selection of recent blog links for general recommendations
export const getRecentBlogLinks = (allLinks: BlogLink[], count: number = 3): BlogLink[] => {
  if (allLinks.length === 0) return [];
  
  // Take recent links and shuffle them
  const recentLinks = allLinks.slice(0, Math.min(10, allLinks.length));
  const shuffled = [...recentLinks].sort(() => Math.random() - 0.5);
  
  return shuffled.slice(0, count);
};
