
import React from 'react';
import { Camera, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TicketScanner = () => {
  const handleScanTicket = () => {
    console.log('Opening camera for ticket scanning...');
    // TODO: Implement camera functionality
  };

  const handleUploadTicket = () => {
    console.log('Opening file picker for ticket upload...');
    // TODO: Implement file upload functionality
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-tixapp-navy">
          Add Your Ticket
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleScanTicket}
          className="w-full h-14 bg-tixapp-navy hover:bg-tixapp-navy-light text-white"
          aria-label="Scan ticket with camera"
        >
          <Camera className="h-5 w-5 mr-2" />
          Scan with Camera
        </Button>
        
        <Button
          onClick={handleUploadTicket}
          variant="outline"
          className="w-full h-14 border-tixapp-teal text-tixapp-teal hover:bg-tixapp-teal hover:text-white"
          aria-label="Upload ticket from device"
        >
          <Upload className="h-5 w-5 mr-2" />
          Upload from Device
        </Button>
      </CardContent>
    </Card>
  );
};

export default TicketScanner;
