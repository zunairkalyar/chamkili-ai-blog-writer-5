import React, { useState } from 'react';
import { CHAMKILI_CREDENTIALS } from '../services/shopifyService';

interface DebugResult {
  test: string;
  status: number;
  success: boolean;
  data?: any;
  error?: string;
}

const ShopifyDebugger: React.FC = () => {
  const [results, setResults] = useState<DebugResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    const testResults: DebugResult[] = [];
    const { storeName, accessToken } = CHAMKILI_CREDENTIALS;

    // Test 1: Shop Info (Basic connectivity)
    try {
      const shopResponse = await fetch(`https://corsproxy.io/?https://${storeName}.myshopify.com/admin/api/2024-07/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      const shopResult: DebugResult = {
        test: 'Shop Info',
        status: shopResponse.status,
        success: shopResponse.ok,
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

      testResults.push(shopResult);
    } catch (error) {
      testResults.push({
        test: 'Shop Info',
        status: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test 2: Blogs API
    try {
      const blogsResponse = await fetch(`https://corsproxy.io/?https://${storeName}.myshopify.com/admin/api/2024-07/blogs.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      const blogsResult: DebugResult = {
        test: 'Blogs API',
        status: blogsResponse.status,
        success: blogsResponse.ok,
      };

      if (blogsResponse.ok) {
        const blogsData = await blogsResponse.json();
        blogsResult.data = blogsData;
      } else {
        blogsResult.error = await blogsResponse.text();
      }

      testResults.push(blogsResult);
    } catch (error) {
      testResults.push({
        test: 'Blogs API',
        status: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test 3: Alternative API version
    try {
      const altResponse = await fetch(`https://corsproxy.io/?https://${storeName}.myshopify.com/admin/api/2023-10/blogs.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      const altResult: DebugResult = {
        test: 'Blogs API (2023-10)',
        status: altResponse.status,
        success: altResponse.ok,
      };

      if (altResponse.ok) {
        const altData = await altResponse.json();
        altResult.data = altData;
      } else {
        altResult.error = await altResponse.text();
      }

      testResults.push(altResult);
    } catch (error) {
      testResults.push({
        test: 'Blogs API (2023-10)',
        status: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    setResults(testResults);
    setIsRunning(false);
  };

  const getStatusColor = (success: boolean, status: number) => {
    if (success) return 'text-green-600 bg-green-50';
    if (status === 401) return 'text-yellow-600 bg-yellow-50';
    if (status === 403) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getRecommendation = (result: DebugResult) => {
    if (result.success) return '✅ Working correctly';
    if (result.status === 401) return '🔑 Invalid API token';
    if (result.status === 403) return '🚫 Missing permissions';
    if (result.status === 404) return '❓ Endpoint not found';
    if (result.status === 0) return '🌐 Network/CORS error';
    return `❌ Error ${result.status}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-6">
      <h3 className="text-xl font-serif font-bold text-[#C57F5D] mb-4 flex items-center gap-3">
        🔍 Shopify Connection Debugger
      </h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Store: <code className="bg-gray-100 px-2 py-1 rounded">{CHAMKILI_CREDENTIALS.storeName}.myshopify.com</code>
        </p>
        <p className="text-sm text-gray-600">
          Token: <code className="bg-gray-100 px-2 py-1 rounded">{CHAMKILI_CREDENTIALS.accessToken.substring(0, 10)}...</code>
        </p>
      </div>

      <button
        onClick={runTests}
        disabled={isRunning}
        className="flex items-center justify-center gap-2 bg-[#D18F70] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#C57F5D] disabled:opacity-50 disabled:cursor-not-allowed mb-4"
      >
        {isRunning ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Running Tests...
          </>
        ) : (
          '🚀 Run Shopify Tests'
        )}
      </button>

      {results.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800">Test Results:</h4>
          {results.map((result, index) => (
            <div key={index} className={`p-4 rounded-lg border ${getStatusColor(result.success, result.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold">{result.test}</h5>
                <span className="text-sm font-mono">Status: {result.status}</span>
              </div>
              
              <p className="text-sm mb-2">{getRecommendation(result)}</p>
              
              {result.error && (
                <div className="mt-2">
                  <p className="text-xs font-semibold">Error:</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">{result.error}</pre>
                </div>
              )}
              
              {result.data && (
                <div className="mt-2">
                  <p className="text-xs font-semibold">Data:</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">{JSON.stringify(result.data, null, 2)}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopifyDebugger;
