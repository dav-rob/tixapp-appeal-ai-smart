
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const TicketScanner = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      console.log('Starting camera...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      // Fallback to file upload if camera fails
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        // Convert to blob and process
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('Image captured, triggering OCR...');
            // TODO: Process with OCR and navigate to Screen 3 (Ticket Details)
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const handleUploadFromGallery = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('File selected from gallery:', file.name);
        // TODO: Process uploaded file with OCR and navigate to Screen 3
      }
    };
    input.click();
  };

  useEffect(() => {
    // Start camera when component mounts
    startCamera();
    
    // Cleanup when component unmounts
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Camera Preview Area - 80% of screen */}
      <div className="relative flex-1 bg-black overflow-hidden" style={{ height: '80vh' }}>
        {isCameraActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Focus Area Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-2 border-white border-dashed rounded-lg w-80 h-60 flex items-center justify-center">
                <span className="text-white text-sm bg-black/50 px-2 py-1 rounded">
                  Position ticket within this area
                </span>
              </div>
            </div>
            
            {/* Capture Button */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <Button
                onClick={captureImage}
                className="w-16 h-16 rounded-full bg-white border-4 border-tixapp-navy hover:bg-gray-100 focus:ring-4 focus:ring-white/50"
                aria-label="Capture ticket image"
              >
                <div className="w-8 h-8 rounded-full bg-tixapp-navy"></div>
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Starting camera...</p>
              <p className="text-sm opacity-75">Please allow camera access</p>
            </div>
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Instructions and Controls - 20% of screen */}
      <div className="p-4 space-y-4 bg-white" style={{ minHeight: '20vh' }}>
        {/* Upload from Gallery Button */}
        <Button
          onClick={handleUploadFromGallery}
          variant="outline"
          className="w-full h-12 border-tixapp-teal text-tixapp-teal hover:bg-tixapp-teal hover:text-white focus:ring-2 focus:ring-tixapp-teal"
          aria-label="Upload ticket from device gallery"
        >
          <Upload className="h-5 w-5 mr-2" />
          Upload from Gallery
        </Button>

        {/* Help with Scanning */}
        <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full text-tixapp-navy hover:bg-tixapp-gray/20 focus:ring-2 focus:ring-tixapp-teal"
              aria-label="Get help with scanning"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Help with scanning
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle className="text-tixapp-navy">Scanning Tips</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm text-gray-700">
              <p>• Ensure good lighting on your ticket</p>
              <p>• Hold your phone steady while capturing</p>
              <p>• Make sure all text is clearly visible</p>
              <p>• Avoid shadows or glare on the ticket</p>
              <p>• Position the ticket flat and straight</p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Multi-scan Information */}
        <Card className="bg-tixapp-gray/10 border-tixapp-teal/20">
          <CardContent className="p-3">
            <p className="text-sm text-gray-700 text-center">
              <strong>Need to scan more pages?</strong> You can take multiple scans if your ticket is too long.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TicketScanner;
