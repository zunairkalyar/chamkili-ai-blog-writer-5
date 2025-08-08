export interface ShopifyBlog {
  id: number;
  title: string;
}

export interface ShopifyCredentials {
  storeName:string;
  accessToken: string;
}

// Chamkili store credentials - uses environment variables
export const CHAMKILI_CREDENTIALS: ShopifyCredentials = {
  storeName: process.env.NEXT_PUBLIC_SHOPIFY_STORE_NAME || 'uxxpvu-hd',
  accessToken: process.env.NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN || 'shpat_PLACEHOLDER_TOKEN_SET_IN_VERCEL_ENV'
};

interface ShopifyMetafield {
  key: string;
  namespace: string;
  value: string;
  type: string;
}

const API_VERSION = '2024-07';

// Use our internal Vercel proxy for better reliability
function getProxyUrl() {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/shopify-proxy`;
  }
  return '/api/shopify-proxy';
}

async function shopifyFetch(url: string, creds: ShopifyCredentials, options: RequestInit = {}): Promise<any> {
  const { storeName, accessToken } = creds;
  if (!storeName || !accessToken) {
    throw new Error("Shopify store name and access token are required.");
  }
  
  const targetUrl = `https://${storeName}.myshopify.com/admin/api/${API_VERSION}/${url}`;
  const proxyUrl = getProxyUrl();
  
  console.log(`Making Shopify API request to: ${targetUrl}`);
  console.log(`Using proxy: ${proxyUrl}`);

  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: targetUrl,
        method: options.method || 'GET',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body,
      }),
    });

    if (!response.ok) {
      let errorBody = 'Could not read error response.';
      try {
        const errorData = await response.json();
        errorBody = JSON.stringify(errorData);
      } catch (e) {
        errorBody = await response.text();
      }
      throw new Error(`Shopify API Error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    console.log('Shopify API request successful');
    return data;
  } catch (error) {
    console.error('Shopify API request failed:', error);
    throw new Error(`Failed to communicate with Shopify: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getBlogs(creds: ShopifyCredentials): Promise<ShopifyBlog[]> {
  const data = await shopifyFetch('blogs.json', creds);
  
  // If no blogs exist, create a default one
  if (!data.blogs || data.blogs.length === 0) {
    console.log('No blogs found, creating default blog...');
    try {
      const newBlog = await createBlog(creds, 'Chamkili Blog', 'Our official beauty and skincare blog');
      return [newBlog];
    } catch (error) {
      console.error('Failed to create default blog:', error);
      throw new Error('No blogs found and unable to create one. Please create a blog in your Shopify admin first.');
    }
  }
  
  return data.blogs;
}

export async function createBlog(creds: ShopifyCredentials, title: string, handle?: string): Promise<ShopifyBlog> {
  const payload = {
    blog: {
      title: title,
      handle: handle || title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    }
  };

  const data = await shopifyFetch('blogs.json', creds, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  
  return data.blog;
}

export async function createArticle(
  creds: ShopifyCredentials,
  blogId: number,
  generatedContent: string,
  metaTitle?: string,
  metaDescription?: string
): Promise<{ article: { id: number; admin_graphql_api_id: string } }> {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = generatedContent;
  
  const h1 = tempDiv.querySelector('h1');
  const articleTitle = h1 ? h1.innerText.trim() : 'Untitled Post';
  if (h1) {
    h1.remove();
  }
  const articleBody = tempDiv.innerHTML;

  const metafields: ShopifyMetafield[] = [];
  if (metaTitle) {
    metafields.push({
      key: 'title_tag',
      namespace: 'global',
      value: metaTitle,
      type: 'single_line_text_field'
    });
  }
   if (metaDescription) {
    metafields.push({
      key: 'description_tag',
      namespace: 'global',
      value: metaDescription,
      type: 'single_line_text_field'
    });
  }


  const payload = {
    article: {
      title: articleTitle,
      author: 'Chamkili AI Writer',
      body_html: articleBody,
      published: true,
      ...(metafields.length > 0 && { metafields }),
    },
  };

  const data = await shopifyFetch(`blogs/${blogId}/articles.json`, creds, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
}

// Upload image to Shopify and return the image URL
export async function uploadImageToShopify(
  creds: ShopifyCredentials,
  imageUrl: string,
  filename: string = 'blog-image',
  altText: string = 'Blog image'
): Promise<string> {
  try {
    console.log('🔄 Uploading image to Shopify:', imageUrl.substring(0, 50) + '...');
    
    // First, fetch the image from the external URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image from external URL');
    }
    
    const imageBlob = await imageResponse.blob();
    const imageBase64 = await blobToBase64(imageBlob);
    
    // Remove the data URL prefix if present
    const base64Data = imageBase64.replace(/^data:[^;]+;base64,/, '');
    
    // Create a unique filename
    const timestamp = Date.now();
    const extension = getImageExtension(imageBlob.type);
    const uniqueFilename = `${filename}-${timestamp}.${extension}`;
    
    // Upload to Shopify Files API
    const payload = {
      file: {
        filename: uniqueFilename,
        content_type: imageBlob.type,
        attachment: base64Data
      }
    };
    
    const data = await shopifyFetch('files.json', creds, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    if (data.file && data.file.public_url) {
      console.log('✅ Image uploaded to Shopify successfully');
      return data.file.public_url;
    } else {
      throw new Error('No public URL returned from Shopify');
    }
    
  } catch (error) {
    console.error('❌ Failed to upload image to Shopify:', error);
    // Return original URL as fallback
    console.log('🔄 Using original image URL as fallback');
    return imageUrl;
  }
}

// Helper function to convert blob to base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Helper function to get file extension from MIME type
function getImageExtension(mimeType: string): string {
  const extensions: { [key: string]: string } = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg'
  };
  
  return extensions[mimeType] || 'jpg';
}
