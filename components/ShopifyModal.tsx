import React, { useState, useEffect } from 'react';

interface ShopifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (storeName: string, accessToken: string) => void;
  initialStoreName?: string;
  initialAccessToken?: string;
}

const ShopifyModal: React.FC<ShopifyModalProps> = ({ isOpen, onClose, onSave, initialStoreName = '', initialAccessToken = '' }) => {
  const [storeName, setStoreName] = useState(initialStoreName);
  const [accessToken, setAccessToken] = useState(initialAccessToken);

  useEffect(() => {
    setStoreName(initialStoreName);
    setAccessToken(initialAccessToken);
  }, [initialStoreName, initialAccessToken, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (storeName.trim() && accessToken.trim()) {
      onSave(storeName.trim(), accessToken.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-8 m-4 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold font-serif text-[#C57F5D] mb-4">Shopify Configuration</h2>
        <p className="text-gray-600 mb-6">
          Enter your Shopify details to publish posts directly. This information is saved only in your browser.
        </p>
        <div className="space-y-4">
          <div>
            <label htmlFor="shopifyStore" className="block text-sm font-medium text-gray-700">
              Shopify Store Name
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                id="shopifyStore"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value.replace(/\.myshopify\.com/g, ''))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#C57F5D] focus:border-[#C57F5D]"
                placeholder="your-store-name"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 sm:text-sm">.myshopify.com</span>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="shopifyToken" className="block text-sm font-medium text-gray-700">
              Admin API Access Token
            </label>
            <input
              type="password"
              id="shopifyToken"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#C57F5D] focus:border-[#C57F5D]"
              placeholder="shpat_..."
            />
            <p className="mt-2 text-xs text-gray-500">
              Your token starts with "shpat_" and is found in your custom app's API credentials. It will be stored locally and treated like a password.
            </p>
          </div>
        </div>
        <div className="mt-8 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!storeName.trim() || !accessToken.trim()}
            className="px-4 py-2 bg-[#D18F70] text-white rounded-md hover:bg-[#C57F5D] disabled:bg-gray-400"
          >
            Save & Connect
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopifyModal;