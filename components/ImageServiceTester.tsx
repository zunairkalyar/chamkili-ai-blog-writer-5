import React, { useState } from 'react';
import { testImageServices, generateFreeImage, generatePlaceholderImage } from '../services/freeImageService';

interface ImageServiceTesterProps {
    className?: string;
}

export function ImageServiceTester({ className }: ImageServiceTesterProps) {
    const [isTestingServices, setIsTestingServices] = useState(false);
    const [serviceStatus, setServiceStatus] = useState<{ service: string, available: boolean }[]>([]);
    const [isGeneratingTest, setIsGeneratingTest] = useState(false);
    const [testImageUrl, setTestImageUrl] = useState<string>('');
    const [testError, setTestError] = useState<string>('');

    const handleTestServices = async () => {
        setIsTestingServices(true);
        try {
            const results = await testImageServices();
            setServiceStatus(results);
        } catch (error) {
            console.error('Failed to test image services:', error);
        } finally {
            setIsTestingServices(false);
        }
    };

    const handleGenerateTestImage = async () => {
        setIsGeneratingTest(true);
        setTestError('');
        setTestImageUrl('');
        
        try {
            const testPrompt = "A vibrant flat lay of various skincare products (cleanser, toner, serum, moisturizer, sunscreen) arranged neatly on a pastel background";
            const result = await generateFreeImage(testPrompt, '1:1', 'Minimalist & Clean', '');
            
            if (result.success && result.imageUrl) {
                setTestImageUrl(result.imageUrl);
            } else {
                setTestError(result.error || 'Unknown error');
                // Show placeholder as fallback
                setTestImageUrl(generatePlaceholderImage(testPrompt));
            }
        } catch (error) {
            setTestError(error instanceof Error ? error.message : String(error));
            // Show placeholder as fallback
            setTestImageUrl(generatePlaceholderImage("Test image generation failed"));
        } finally {
            setIsGeneratingTest(false);
        }
    };

    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🖼️ Free Image Generation Status
            </h3>
            
            <div className="space-y-4">
                {/* Test Services Button */}
                <div>
                    <button
                        onClick={handleTestServices}
                        disabled={isTestingServices}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isTestingServices ? 'Testing Services...' : 'Test Image Services'}
                    </button>
                </div>

                {/* Service Status */}
                {serviceStatus.length > 0 && (
                    <div>
                        <h4 className="font-medium text-gray-700 mb-2">Service Availability:</h4>
                        <div className="space-y-1">
                            {serviceStatus.map((service, index) => (
                                <div key={index} className="flex items-center text-sm">
                                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${service.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    <span className="font-medium">{service.service}:</span>
                                    <span className={`ml-1 ${service.available ? 'text-green-600' : 'text-red-600'}`}>
                                        {service.available ? 'Available' : 'Unavailable'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Generate Test Image */}
                <div>
                    <button
                        onClick={handleGenerateTestImage}
                        disabled={isGeneratingTest}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGeneratingTest ? 'Generating Test Image...' : 'Generate Test Image'}
                    </button>
                </div>

                {/* Test Results */}
                {testError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                        <strong>Error:</strong> {testError}
                    </div>
                )}

                {testImageUrl && (
                    <div>
                        <h4 className="font-medium text-gray-700 mb-2">Generated Test Image:</h4>
                        <div className="max-w-md">
                            <img 
                                src={testImageUrl} 
                                alt="Test generated image"
                                className="w-full rounded border border-gray-200"
                                onError={(e) => {
                                    console.error('Failed to load generated image');
                                    const target = e.target as HTMLImageElement;
                                    target.src = generatePlaceholderImage("Image failed to load");
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Info */}
                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                    <p><strong>Note:</strong> This app now uses free image generation services including:</p>
                    <ul className="mt-1 ml-4 list-disc">
                        <li><strong>Pollinations.ai</strong> - Completely free, no API key required</li>
                        <li><strong>Hugging Face</strong> - Free tier available for basic usage</li>
                        <li><strong>Placeholder fallback</strong> - Always works when other services fail</li>
                    </ul>
                    <p className="mt-2">If all services fail, the app will automatically show a placeholder image with your prompt text.</p>
                </div>
            </div>
        </div>
    );
}
