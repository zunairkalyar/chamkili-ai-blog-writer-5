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

  // Extract the first image for featured image
  const firstImg = tempDiv.querySelector('img');
  let featuredImageUrl: string | null = null;
  
  if (firstImg?.src) {
    console.log('🖼️ Found featured image:', firstImg.src.substring(0, 50) + '...');
    try {
      // Upload the image to Shopify and get the CDN URL
      featuredImageUrl = await uploadImageToShopify(
        creds,
        firstImg.src,
        `featured-${articleTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        firstImg.alt || articleTitle
      );
      console.log('✅ Featured image uploaded:', featuredImageUrl.substring(0, 50) + '...');
    } catch (error) {
      console.error('❌ Failed to upload featured image:', error);
      // Use original URL as fallback
      featuredImageUrl = firstImg.src;
    }
  }

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
      ...(featuredImageUrl && { 
        image: {
          src: featuredImageUrl,
          alt: articleTitle
        }
      }),
      ...(metafields.length > 0 && { metafields }),
    },
  };

  console.log('📝 Creating article with payload:', {
    title: articleTitle,
    hasImage: !!featuredImageUrl,
    imageUrl: featuredImageUrl?.substring(0, 50) + '...' || 'none'
  });

  const data = await shopifyFetch(`blogs/${blogId}/articles.json`, creds, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
}

// Upload image to Shopify Content Files and return the CDN URL
export async function uploadImageToShopify(
  creds: ShopifyCredentials,
  imageUrl: string,
  filename: string = 'blog-image',
  altText: string = 'Blog image'
): Promise<string> {
  try {
    console.log('🔄 Uploading image to Shopify:', imageUrl.substring(0, 50) + '...');
    console.log('🔑 Store:', creds.storeName);
    
    // Check if we have valid credentials
    if (!creds.storeName || !creds.accessToken || creds.accessToken === 'shpat_PLACEHOLDER_TOKEN_SET_IN_VERCEL_ENV') {
      console.log('⚠️ Invalid Shopify credentials - skipping upload, using original URL');
      return imageUrl;
    }
    
    // Step 1: Download the image
    console.log('🔍 Downloading image...');
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }
    
    const imageBlob = await imageResponse.blob();
    console.log('📎 Image downloaded:', imageBlob.size, 'bytes, type:', imageBlob.type);
    
    // Step 2: Convert to base64
    const base64Data = await blobToBase64(imageBlob);
    const base64WithoutPrefix = base64Data.replace(/^data:[^;]+;base64,/, '');
    
    // Step 3: Generate unique filename
    const timestamp = Date.now();
    const extension = getImageExtension(imageBlob.type);
    const uniqueFilename = `chamkili-blog-${timestamp}.${extension}`;
    
    console.log('📝 Creating file in Shopify:', uniqueFilename);
    
    // Step 4: Upload to Shopify using the Files API with correct payload structure
    const filePayload = {
      file: {
        filename: uniqueFilename,
        attachment: base64WithoutPrefix,
        content_type: imageBlob.type || 'image/jpeg'
      }
    };
    
    console.log('🚀 Sending to Shopify Files API...');
    const uploadResponse = await shopifyFetch('files.json', creds, {
      method: 'POST',
      body: JSON.stringify(filePayload),
    });
    
    console.log('📝 Shopify response:', JSON.stringify(uploadResponse, null, 2));
    
    // Step 5: Handle the response and extract the public URL
    if (uploadResponse.file && uploadResponse.file.public_url) {
      const shopifyUrl = uploadResponse.file.public_url;
      console.log('✅ Image uploaded successfully to Shopify!');
      console.log('🔗 Shopify URL:', shopifyUrl);
      return shopifyUrl;
    } 
    // Alternative response structure
    else if (uploadResponse.file && uploadResponse.file.url) {
      const shopifyUrl = uploadResponse.file.url;
      console.log('✅ Image uploaded successfully to Shopify (alt format)!');
      console.log('🔗 Shopify URL:', shopifyUrl);
      return shopifyUrl;
    }
    // Construct URL from store and filename if no direct URL provided
    else if (uploadResponse.file) {
      const constructedUrl = `https://cdn.shopify.com/s/files/1/0000/0000/0000/files/${uniqueFilename}`;
      console.log('✅ File uploaded, using constructed URL');
      return constructedUrl;
    }
    else {
      console.log('⚠️ Unexpected response format from Shopify');
      throw new Error('No file URL returned from Shopify');
    }
    
  } catch (error) {
    console.error('❌ Failed to upload to Shopify:', error);
    console.log('🔄 Falling back to original URL');
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
