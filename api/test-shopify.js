export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const storeName = process.env.SHOPIFY_STORE_NAME || 'your-store-name';
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN || 'your-access-token';
  
  console.log('Testing Shopify connection...');
  console.log('Store:', storeName);
  console.log('Token (first 10 chars):', accessToken.substring(0, 10) + '...');

  try {
    // Test 1: Shop info (should always work)
    console.log('Test 1: Fetching shop info...');
    const shopResponse = await fetch(`https://${storeName}.myshopify.com/admin/api/2024-07/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    const shopResult = {
      status: shopResponse.status,
      ok: shopResponse.ok,
    };

    if (shopResponse.ok) {
      const shopData = await shopResponse.json();
      shopResult.data = {
        name: shopData.shop?.name,
        domain: shopData.shop?.domain,
      };
    } else {
      shopResult.error = await shopResponse.text();
    }

    // Test 2: Blogs (the failing endpoint)
    console.log('Test 2: Fetching blogs...');
    const blogsResponse = await fetch(`https://${storeName}.myshopify.com/admin/api/2024-07/blogs.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    const blogsResult = {
      status: blogsResponse.status,
      ok: blogsResponse.ok,
    };

    if (blogsResponse.ok) {
      const blogsData = await blogsResponse.json();
      blogsResult.data = blogsData;
    } else {
      blogsResult.error = await blogsResponse.text();
    }

    // Test 3: Check API permissions
    console.log('Test 3: Testing API permissions...');
    const permissionsTest = {
      shop: shopResult.ok,
      blogs: blogsResult.ok,
    };

    res.status(200).json({
      success: true,
      store: storeName,
      tests: {
        shop: shopResult,
        blogs: blogsResult,
        permissions: permissionsTest,
      },
      recommendations: getRecommendations(shopResult, blogsResult),
    });

  } catch (error) {
    console.error('Test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      recommendations: ['Check your internet connection', 'Verify Shopify store is active'],
    });
  }
}

function getRecommendations(shopResult, blogsResult) {
  const recommendations = [];

  if (!shopResult.ok) {
    if (shopResult.status === 401) {
      recommendations.push('API token is invalid or expired');
    } else if (shopResult.status === 403) {
      recommendations.push('API token does not have sufficient permissions');
    } else {
      recommendations.push(`Shop API returned status ${shopResult.status}`);
    }
  }

  if (!blogsResult.ok) {
    if (blogsResult.status === 401) {
      recommendations.push('API token cannot access blogs');
    } else if (blogsResult.status === 403) {
      recommendations.push('API token lacks blogs read permission');
    } else if (blogsResult.status === 404) {
      recommendations.push('Blogs endpoint not found - check API version');
    } else {
      recommendations.push(`Blogs API returned status ${blogsResult.status}`);
    }
  }

  if (shopResult.ok && blogsResult.ok) {
    recommendations.push('All tests passed! API connection is working correctly.');
  }

  return recommendations;
}
