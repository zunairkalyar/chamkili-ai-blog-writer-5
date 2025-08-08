import React, { useState, useEffect } from 'react';
import { autopilotSystem, AutopilotStats, AutopilotConfig } from '../services/autopilotService';
import { CustomerPersona } from '../services/geminiService';

interface AutopilotPanelProps {
  customerPersona: CustomerPersona | null;
  brandVoiceProfile: string | null;
}

const AutopilotPanel: React.FC<AutopilotPanelProps> = ({ 
  customerPersona, 
  brandVoiceProfile 
}) => {
  const [stats, setStats] = useState<AutopilotStats>({ 
    totalBlogs: 0,
    successfulBlogs: 0,
    failedBlogs: 0,
    lastRunTime: 'Never',
    isRunning: false,
    currentActivity: 'Idle'
  });
  
  const [config, setConfig] = useState<AutopilotConfig>({
    enabled: false,
    intervalMinutes: 10,
    maxRetries: 3,
    imageRetryDelaySeconds: 30,
    persona: customerPersona,
    brandVoiceProfile: brandVoiceProfile
  });

  // Update stats every 5 seconds when running
  useEffect(() => {
    const updateStats = () => {
      setStats(autopilotSystem.getStats());
    };

    updateStats(); // Initial update
    
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update autopilot config when persona or brand voice changes
  useEffect(() => {
    const updatedConfig = {
      ...config,
      persona: customerPersona,
      brandVoiceProfile: brandVoiceProfile
    };
    setConfig(updatedConfig);
    autopilotSystem.updateConfig(updatedConfig);
  }, [customerPersona, brandVoiceProfile]);

  const handleStart = () => {
    const startConfig = {
      ...config,
      enabled: true,
      persona: customerPersona,
      brandVoiceProfile: brandVoiceProfile
    };
    
    autopilotSystem.start(startConfig);
    setConfig(startConfig);
  };

  const handleStop = () => {
    autopilotSystem.stop();
    setConfig(prev => ({ ...prev, enabled: false }));
  };

  const handleConfigChange = (key: keyof AutopilotConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    autopilotSystem.updateConfig(newConfig);
  };

  const formatLastRunTime = (timestamp: string) => {
    if (timestamp === 'Never') return 'Never';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const getStatusColor = () => {
    if (stats.isRunning) return 'text-green-600';
    if (stats.failedBlogs > 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusIcon = () => {
    if (stats.isRunning) {
      return (
        <svg className="w-5 h-5 text-green-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="8" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="8" />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Status Section */}
      <div className="bg-gray-50 rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            {getStatusIcon()}
            Autopilot Status
          </h4>
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {stats.isRunning ? '🟢 Active' : '🔴 Stopped'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Total Blogs:</span>
            <span className="font-semibold ml-2">{stats.totalBlogs}</span>
          </div>
          <div>
            <span className="text-gray-500">Successful:</span>
            <span className="font-semibold ml-2 text-green-600">{stats.successfulBlogs}</span>
          </div>
          <div>
            <span className="text-gray-500">Failed:</span>
            <span className="font-semibold ml-2 text-red-600">{stats.failedBlogs}</span>
          </div>
          <div>
            <span className="text-gray-500">Success Rate:</span>
            <span className="font-semibold ml-2">
              {stats.totalBlogs > 0 ? Math.round((stats.successfulBlogs / stats.totalBlogs) * 100) : 0}%
            </span>
          </div>
        </div>
        
        <div className="mt-3 text-sm">
          <div className="text-gray-500">Current Activity:</div>
          <div className="font-medium text-gray-800 mt-1">{stats.currentActivity}</div>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          Last Run: {formatLastRunTime(stats.lastRunTime)}
        </div>
      </div>

      {/* Controls Section */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interval (minutes)
          </label>
          <input
            type="number"
            min="5"
            max="1440"
            value={config.intervalMinutes}
            onChange={(e) => handleConfigChange('intervalMinutes', parseInt(e.target.value) || 10)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            disabled={stats.isRunning}
          />
          <p className="text-xs text-gray-500 mt-1">Time between blog creations (5-1440 minutes)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image Retry Settings
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Max Retries</label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.maxRetries}
                onChange={(e) => handleConfigChange('maxRetries', parseInt(e.target.value) || 3)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                disabled={stats.isRunning}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Retry Delay (seconds)</label>
              <input
                type="number"
                min="10"
                max="300"
                value={config.imageRetryDelaySeconds}
                onChange={(e) => handleConfigChange('imageRetryDelaySeconds', parseInt(e.target.value) || 30)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                disabled={stats.isRunning}
              />
            </div>
          </div>
        </div>

        {/* Persona & Brand Voice Status */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <h5 className="text-sm font-medium text-blue-800 mb-2">🎯 Content Configuration</h5>
          <div className="text-xs text-blue-700 space-y-1">
            <div>
              <span className="font-medium">Persona:</span> 
              {customerPersona ? ` ${customerPersona.name}` : ' None set'}
            </div>
            <div>
              <span className="font-medium">Brand Voice:</span> 
              {brandVoiceProfile ? ' Configured' : ' Default'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {!stats.isRunning ? (
            <button
              onClick={handleStart}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m2-7a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Autopilot
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10h6v4H9z" />
              </svg>
              Stop Autopilot
            </button>
          )}
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-yellow-800">Important</span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            Autopilot will automatically create and publish blogs to your Shopify store every {config.intervalMinutes} minutes. 
            Make sure your Shopify credentials are configured correctly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AutopilotPanel;
