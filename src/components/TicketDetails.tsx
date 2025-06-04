import React, { useState } from 'react';
import { Edit, MapPin, Camera, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const TicketDetails = () => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [pcnSectionOpen, setPcnSectionOpen] = useState(true);
  const [councilSectionOpen, setCouncilSectionOpen] = useState(false);
  const [driverSectionOpen, setDriverSectionOpen] = useState(false);
  const [responsesSectionOpen, setResponsesSectionOpen] = useState(false);
  const [recommendationSectionOpen, setRecommendationSectionOpen] = useState(false);
  
  // Mock data - in real app this would come from OCR
  const [pcnData, setPcnData] = useState({
    pcnNumber: 'PCN123456789',
    contraventionCode: '01',
    description: 'Parked in a restricted street during prescribed hours',
    council: 'Westminster City Council',
    location: 'Baker Street, London W1U 6TU',
    geoLocation: '51.5074, -0.1278',
    ceoCode: 'CEO001',
    observationPeriod: '10 minutes',
    make: 'Ford',
    model: 'Focus',
    colour: 'Blue'
  });

  const councilInfo = {
    pictures: [
      { id: 1, url: '/placeholder.svg', description: 'Vehicle parked in restricted area' },
      { id: 2, url: '/placeholder.svg', description: 'Signage showing restrictions' }
    ],
    textDescriptions: [
      'The vehicle was observed parked in a restricted area during prescribed hours.',
      'Clear signage was visible indicating parking restrictions.'
    ]
  };

  const [driverInfo, setDriverInfo] = useState({
    pictures: [],
    textEntries: ['I was only parked for 5 minutes to drop off a prescription.']
  });

  const driverResponses = [
    {
      question: 'Were you the driver at the time?',
      answer: 'Yes'
    },
    {
      question: 'Was this an emergency situation?',
      answer: 'Yes, I was delivering medication to an elderly relative'
    }
  ];

  const recommendation = {
    decision: 'Challenge',
    confidence: 85,
    reasons: [
      'Short parking duration for medical emergency',
      'Lack of alternative parking options',
      'Humanitarian circumstances'
    ]
  };

  const handleEditField = (field: string, value: string) => {
    setPcnData(prev => ({ ...prev, [field]: value }));
    setIsEditing(null);
  };

  const addDriverText = () => {
    setDriverInfo(prev => ({
      ...prev,
      textEntries: [...prev.textEntries, '']
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* PCN Ticket Information */}
      <Card>
        <Collapsible open={pcnSectionOpen} onOpenChange={setPcnSectionOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardTitle className="text-tixapp-navy flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  PCN Ticket Information
                </div>
                {pcnSectionOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 font-medium">
                  Please check the extracted data against your PCN ticket and make any necessary corrections.
                </p>
              </div>
              {Object.entries(pcnData).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    {isEditing === key ? (
                      <Input
                        value={value}
                        onChange={(e) => handleEditField(key, e.target.value)}
                        onBlur={() => setIsEditing(null)}
                        onKeyPress={(e) => e.key === 'Enter' && setIsEditing(null)}
                        className="mt-1"
                        autoFocus
                      />
                    ) : (
                      <p className="text-gray-900 mt-1">{value}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(key)}
                    className="text-tixapp-teal hover:text-tixapp-teal-dark"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Council Website Information */}
      <Card>
        <Collapsible open={councilSectionOpen} onOpenChange={setCouncilSectionOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardTitle className="text-tixapp-navy flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Council Evidence
                </div>
                {councilSectionOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Pictures ({councilInfo.pictures.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {councilInfo.pictures.map((picture) => (
                    <div key={picture.id} className="space-y-2">
                      <img
                        src={picture.url}
                        alt={picture.description}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <p className="text-xs text-gray-600">{picture.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Council Descriptions</h4>
                <div className="space-y-2">
                  {councilInfo.textDescriptions.map((desc, index) => (
                    <p key={index} className="text-gray-700 p-3 bg-gray-50 rounded-lg">
                      {desc}
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Driver Information */}
      <Card>
        <Collapsible open={driverSectionOpen} onOpenChange={setDriverSectionOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardTitle className="text-tixapp-navy flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Your Evidence
                </div>
                {driverSectionOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Your Pictures</h4>
                <Button variant="outline" className="border-dashed border-2 w-full h-24">
                  <Camera className="h-8 w-8 text-gray-400" />
                  <span className="ml-2 text-gray-600">Add Pictures (0/20)</span>
                </Button>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Your Comments</h4>
                <div className="space-y-3">
                  {driverInfo.textEntries.map((entry, index) => (
                    <Textarea
                      key={index}
                      value={entry}
                      onChange={(e) => {
                        const newEntries = [...driverInfo.textEntries];
                        newEntries[index] = e.target.value;
                        setDriverInfo(prev => ({ ...prev, textEntries: newEntries }));
                      }}
                      placeholder="Add your comments about this ticket..."
                      className="min-h-[80px]"
                    />
                  ))}
                  <Button
                    variant="outline"
                    onClick={addDriverText}
                    className="w-full border-dashed border-2"
                  >
                    Add More Comments
                  </Button>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Driver Responses */}
      <Card>
        <Collapsible open={responsesSectionOpen} onOpenChange={setResponsesSectionOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardTitle className="text-tixapp-navy flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Your Responses
                </div>
                {responsesSectionOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {driverResponses.map((response, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900 mb-2">{response.question}</p>
                  <p className="text-gray-700">{response.answer}</p>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Final Recommendation */}
      <Card>
        <Collapsible open={recommendationSectionOpen} onOpenChange={setRecommendationSectionOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardTitle className="text-tixapp-navy flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Appeal Recommendation
                </div>
                {recommendationSectionOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-6">
              <div className={`text-center p-6 rounded-lg ${
                recommendation.decision === 'Challenge' 
                  ? 'bg-red-100 border-2 border-red-300' 
                  : 'bg-green-100 border-2 border-green-300'
              }`}>
                <h2 className={`text-2xl font-bold mb-2 ${
                  recommendation.decision === 'Challenge' ? 'text-red-700' : 'text-green-700'
                }`}>
                  AI Recommendation: {recommendation.decision.toUpperCase()}
                </h2>
                <p className="text-gray-700 mb-4">
                  Confidence: {recommendation.confidence}%
                </p>
                <Button
                  className={`${
                    recommendation.decision === 'Challenge'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white px-8 py-3`}
                >
                  {recommendation.decision === 'Challenge' ? 'Proceed with Challenge' : 'Pay Ticket'}
                </Button>
              </div>

              <div className="mt-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="evidence">
                    <AccordionTrigger className="text-lg font-semibold text-tixapp-navy">
                      Evidence & Reasons
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-green-700 mb-2">Supporting Evidence (Driver)</h4>
                        <ul className="space-y-1">
                          {recommendation.reasons.map((reason, index) => (
                            <li key={index} className="text-gray-700 flex items-start">
                              <span className="text-green-600 mr-2">•</span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-red-700 mb-2">Council Evidence</h4>
                        <ul className="space-y-1">
                          <li className="text-gray-700 flex items-start">
                            <span className="text-red-600 mr-2">•</span>
                            Vehicle clearly parked in restricted area
                          </li>
                          <li className="text-gray-700 flex items-start">
                            <span className="text-red-600 mr-2">•</span>
                            Signage was visible and clear
                          </li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};

export default TicketDetails;
