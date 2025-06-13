import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DocutainSDK, Source } from '@docutain/capacitor-plugin-docutain-sdk';
import { toast } from '@/components/ui/sonner';
import { AlertCircle, Camera, HelpCircle, Upload } from 'lucide-react';
import { useState } from 'react';

interface TicketScannerProps {
  onNavigateToDetails?: () => void;
}


const TicketScanner = ({ onNavigateToDetails }: TicketScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScanDocument = async (source: Source = Source.Camera) => {
    setIsScanning(true);
    setError(null);
    
    try {
      console.log('Starting document scan with source:', source);
      
      // Start the document scanner
      await DocutainSDK.scanDocument({
        config: {
          source: source,
          // Configure scanner options
          allowCaptureModeSetting: true,
          pageEditConfig: {
            allowPageFilter: true,
            allowPageRotation: true,
            allowPageArrangement: true,
            allowPageCropping: true,
            pageArrangementShowDeleteButton: true,
            pageArrangementShowPageNumber: true
          }
        }
      });

      console.log('Document scan completed successfully');

      // Extract text from the scanned document
      try {
        const textResult = await DocutainSDK.getText();
        console.log('Extracted text:', textResult.text);
        
        // Display extracted text in a scrollable toast
        if (textResult.text) {
          toast('Text Extraction Complete', {
            description: (
              <div className="max-h-96 overflow-y-auto pr-2">
                <div className="text-sm font-medium mb-2">Extracted Text:</div>
                <pre className="text-xs whitespace-pre-wrap font-mono bg-gray-50 p-2 rounded border">
                  {textResult.text}
                </pre>
              </div>
            ),
            duration: 15000, // 15 seconds to give time to read the raw text
          });
        }
        
        // Navigate to details page with the extracted data
        if (onNavigateToDetails) {
          onNavigateToDetails();
        }
      } catch (extractError) {
        console.error('Error extracting text from document:', extractError);
        // Still navigate to details even if text extraction fails
        if (onNavigateToDetails) {
          onNavigateToDetails();
        }
      }

    } catch (scanError: unknown) {
      console.error('Document scan error:', scanError);
      
      if ((scanError as { code?: string })?.code === 'CANCELED') {
        console.log('User canceled the scan');
        setError('Scan was canceled');
      } else {
        setError('Failed to scan document. Please try again.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleCameraScan = () => {
    handleScanDocument(Source.Camera);
  };

  // const handleGalleryScan = () => {
  //   handleScanDocument(Source.Gallery);
  // };

  const handleGalleryMultipleScan = () => {
    handleScanDocument(Source.GalleryMultiple);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header Section */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-tixapp-navy text-center">
          Scan Your Ticket
        </h1>
        <p className="text-gray-600 text-center mt-2">
          Take a photo or upload an image of your parking ticket
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 space-y-4">
        
        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Scanning Instructions */}
        {/* <Card className="bg-tixapp-gray/10 border-tixapp-teal/20">
          <CardContent className="p-4">
            <h3 className="font-semibold text-tixapp-navy mb-2">
              Professional Document Scanning
            </h3>
            <p className="text-sm text-gray-700">
              The advanced scanner will automatically detect your ticket edges, 
              enhance image quality, and extract text for your appeal.
            </p>
          </CardContent>
        </Card>
        */}

        {/* Scan Options */}
        <div className="space-y-3">
          
          {/* Camera Scan Button */}
          <Button
            onClick={handleCameraScan}
            disabled={isScanning}
            className="w-full h-14 bg-tixapp-navy hover:bg-tixapp-navy/90 text-white focus:ring-2 focus:ring-tixapp-teal"
          >
            <Camera className="h-6 w-6 mr-3" />
            {isScanning ? 'Scanning...' : 'Scan with Camera'}
          </Button>

          {/* Gallery Multiple Button */}
          <Button
            onClick={handleGalleryMultipleScan}
            disabled={isScanning}
            variant="outline"
            className="w-full h-14 border-tixapp-teal text-tixapp-teal hover:bg-tixapp-teal hover:text-white focus:ring-2 focus:ring-tixapp-teal"
          >
            <Upload className="h-5 w-5 mr-2" />
            Select Multiple Images
          </Button>

          {/* Gallery Upload Button */}
          {/*
          <Button
            onClick={handleGalleryScan}
            disabled={isScanning}
            variant="outline"
            className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-tixapp-teal"
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload from Gallery
          </Button>
          */}
        </div>

        {/* Help Section */}
        <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full text-tixapp-navy hover:bg-tixapp-gray/20 focus:ring-2 focus:ring-tixapp-teal"
              disabled={isScanning}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Scanning Tips
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle className="text-tixapp-navy">Scanning Tips</DialogTitle>
              <DialogDescription>
                Get the best results with these professional scanning tips:
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm text-gray-700">
              <p>• <strong>Automatic Detection:</strong> The scanner will find ticket edges automatically</p>
              <p>• <strong>Good Lighting:</strong> Ensure your ticket is well-lit</p>
              <p>• <strong>Steady Hands:</strong> Hold your device steady while scanning</p>
              <p>• <strong>Clear Text:</strong> Make sure all text is visible and unfolded</p>
              <p>• <strong>Multiple Images:</strong> Use "Select Multiple Images" for multi-page tickets</p>
              <p>• <strong>Review & Edit:</strong> You can crop and enhance after scanning</p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Feature Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <p className="text-sm text-blue-800 text-center">
              <strong>Professional Features:</strong> Automatic edge detection, image enhancement, 
              text recognition, and multi-image support for complete ticket documentation.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TicketScanner;