import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DocutainSDK, Source } from '@docutain/capacitor-plugin-docutain-sdk';
import { AlertCircle, Camera, HelpCircle, Upload } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketModal from '@/components/TicketModal';

import { ticketExtractionService } from '@/services/ticketExtractionService';
import { AppLogger } from '@/utils/logger';

interface TicketField {
  key: string;
  label: string;
  value: string | number | null;
  type: 'text' | 'number' | 'datetime' | 'currency';
  editable: boolean;
}

const TicketScanner = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [ticketData, setTicketData] = useState<TicketField[]>([]);
  const [isProcessingData, setIsProcessingData] = useState(false);

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
          },
          // Customize button appearance
          buttonConfig: {
            buttonScanFinish: {
              title: "DONE",
              icon: "done_blue_icon"
            }
          }
        }
      });

      console.log('Document scan completed successfully');

      // Extract text from the scanned document
      try {
        const textResult = await DocutainSDK.getText();
        console.log('Extracted text:', textResult.text);
        
        // Extract and process ticket data
        if (textResult.text) {
          setExtractedText(textResult.text);
          
          // Call API to extract structured ticket data
          try {
            setIsProcessingData(true);
            AppLogger.info('TicketScanner', 'Starting API processing for extracted text');
            
            const apiResponse = await ticketExtractionService.extractTicketData(textResult.text);
            AppLogger.api('TicketScanner', 'extract_ticket', { ocrTextLength: textResult.text.length }, apiResponse);
            
            const formattedData = ticketExtractionService.formatTicketDataForDisplay(apiResponse);
            AppLogger.state('TicketScanner', 'Formatted data for modal', undefined, {
              formattedDataLength: formattedData.length,
              fields: formattedData.map(f => ({ key: f.key, label: f.label, hasValue: !!f.value }))
            });
            
            AppLogger.state('TicketScanner', 'Setting ticket data state', ticketData.length, formattedData.length);
            setTicketData(formattedData);
            
            AppLogger.modal('TicketScanner', 'Opening modal with API data');
            setShowTicketModal(true);
            
          } catch (apiError) {
            AppLogger.error('TicketScanner', 'API processing failed', apiError);
            
            // Show modal anyway with placeholder data and raw text
            AppLogger.modal('TicketScanner', 'Opening modal with fallback data due to API error');
            setTicketData([]);
            setShowTicketModal(true);
            
            setError(`Failed to process ticket data: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
          } finally {
            setIsProcessingData(false);
          }
        }
        
        // Navigate to details page with the extracted data
        // if (onNavigateToDetails) {
        //   onNavigateToDetails();
        // }
      } catch (extractError) {
        console.error('Error extracting text from document:', extractError);
        // Still navigate to details even if text extraction fails
        // if (onNavigateToDetails) {
        //   onNavigateToDetails();
        // }
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

  const handleModalSave = (data: Record<string, unknown>) => {
    console.log('Saving ticket data:', data);
    setShowTicketModal(false);
  };

  const handleModalEdit = () => {
    console.log('Editing ticket');
  };

  const handleModalDelete = () => {
    console.log('Deleting ticket');
    setShowTicketModal(false);
  };

  const handleModalClose = () => {
    setShowTicketModal(false);
  };

  const handleNavigateToDetails = () => {
    navigate('/details');
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

        {/* Processing Alert */}
        {isProcessingData && (
          <Alert className="border-blue-200 bg-blue-50">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <AlertDescription className="text-blue-700">
              Processing ticket data with AI...
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
            disabled={isScanning || isProcessingData}
            className="w-full h-14 bg-tixapp-navy hover:bg-tixapp-navy/90 text-white focus:ring-2 focus:ring-tixapp-teal"
          >
            <Camera className="h-6 w-6 mr-3" />
{isScanning || isProcessingData ? (isProcessingData ? 'Processing...' : 'Scanning...') : 'Scan with Camera'}
          </Button>

          {/* Gallery Multiple Button */}
          <Button
            onClick={handleGalleryMultipleScan}
            disabled={isScanning || isProcessingData}
            variant="outline"
            className="w-full h-14 border-tixapp-teal text-tixapp-teal hover:bg-tixapp-teal hover:text-white focus:ring-2 focus:ring-tixapp-teal"
          >
            <Upload className="h-5 w-5 mr-2" />
{isScanning || isProcessingData ? (isProcessingData ? 'Processing...' : 'Scanning...') : 'Select Multiple Images'}
          </Button>

          {/* Gallery Upload Button */}
          {/*
          <Button
            onClick={handleGalleryScan}
            disabled={isScanning || isProcessingData}
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
              disabled={isScanning || isProcessingData}
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

      {/* Professional Ticket Modal */}
      <TicketModal
        isOpen={showTicketModal}
        onClose={handleModalClose}
        onSave={handleModalSave}
        onEdit={handleModalEdit}
        onDelete={handleModalDelete}
        extractedText={extractedText}
        onNavigateToDetails={handleNavigateToDetails}
        ticketData={ticketData}
      />
    </div>
  );
};

export default TicketScanner;