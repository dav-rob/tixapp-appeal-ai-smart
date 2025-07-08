import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { testTicketExtractionService } from '@/test/ticketExtractionService.test';

const ServiceTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiResult = await testTicketExtractionService();
      setResult(apiResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const testApiDirectly = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing API directly...');
      const apiUrl = import.meta.env.DEV ? '/api/extract_ticket' : 'https://api.tixappeal.com/extract_ticket';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CURRENT_CUSTOM_API_KEY}`
        },
        body: JSON.stringify({
          ocr_text: 'Test OCR text for direct API call'
        })
      });

      console.log('Direct API response:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        setResult({ directApiTest: true, data });
      } else {
        const errorText = await response.text();
        setError(`Direct API test failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
    } catch (err) {
      setError(`Direct API test error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Ticket Extraction Service Test</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            {import.meta.env.DEV ? (
              <>
                Development mode: Using proxy <code className="bg-gray-100 px-2 py-1 rounded">/api/extract_ticket</code> → <code className="bg-gray-100 px-2 py-1 rounded">https://api.tixappeal.com/extract_ticket</code>
              </>
            ) : (
              <>
                Production mode: <code className="bg-gray-100 px-2 py-1 rounded">https://api.tixappeal.com/extract_ticket</code>
              </>
            )}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button 
              onClick={runTest} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Testing API...' : 'Test Ticket Extraction Service'}
            </Button>
            
            <Button 
              onClick={testApiDirectly} 
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? 'Testing API...' : 'Test API Directly'}
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Success:</h3>
              <pre className="text-green-700 text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="text-sm text-gray-600">
            <p><strong>Note:</strong> Check the browser console for detailed logs.</p>
            <p>The service test uses sample parking ticket OCR data to verify API connectivity and response parsing.</p>
            <p>The direct API test uses simple test text to verify basic API functionality.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceTest;