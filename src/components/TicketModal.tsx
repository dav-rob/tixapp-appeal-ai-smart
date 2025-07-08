import React, { useState, useEffect } from 'react';
import { AppLogger } from '@/utils/logger';
import { X, Edit, Save, Trash2, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface TicketField {
  key: string;
  label: string;
  value: string | number | null;
  type: 'text' | 'number' | 'datetime' | 'currency';
  editable: boolean;
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
  onEdit: () => void;
  onDelete: () => void;
  extractedText: string;
  ticketImage?: string;
  onNavigateToDetails?: () => void;
  ticketData?: TicketField[];
}

const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onEdit,
  onDelete,
  extractedText,
  ticketImage,
  onNavigateToDetails,
  ticketData: initialTicketData
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [ticketData, setTicketData] = useState<TicketField[]>(
    initialTicketData || [
      { key: 'ticket_category', label: 'Ticket Category', value: 'council', type: 'text', editable: true },
      { key: 'pcn_number', label: 'PCN Number', value: 'AB123456C', type: 'text', editable: true },
      { key: 'car_vrm', label: 'Vehicle Registration', value: 'AB12 CDE', type: 'text', editable: true },
      { key: 'contravention_code', label: 'Contravention Code', value: '01', type: 'text', editable: true },
      { key: 'contravention_datetime', label: 'Date of Contravention', value: '2025-07-07 14:30', type: 'datetime', editable: true },
      { key: 'date_of_notice', label: 'Date of Notice', value: '2025-07-07 16:00', type: 'datetime', editable: true },
      { key: 'contravention_description', label: 'Description', value: 'Parking in a restricted area', type: 'text', editable: true },
      { key: 'council', label: 'Council', value: 'Westminster City Council', type: 'text', editable: true },
      { key: 'location', label: 'Location', value: 'Oxford Street, London', type: 'text', editable: true },
      { key: 'ceo_code', label: 'CEO Code', value: 'CEO123', type: 'text', editable: true },
      { key: 'observation_period', label: 'Observation Period', value: '5 minutes', type: 'text', editable: true },
      { key: 'car_make', label: 'Vehicle Make', value: 'Toyota', type: 'text', editable: true },
      { key: 'car_model', label: 'Vehicle Model', value: 'Prius', type: 'text', editable: true },
      { key: 'car_colour', label: 'Vehicle Colour', value: 'Blue', type: 'text', editable: true },
    ]
  );

  // Update local state when initialTicketData prop changes
  useEffect(() => {
    AppLogger.modal('TicketModal', `useEffect triggered - initialTicketData: ${initialTicketData?.length || 0} items`);
    
    if (initialTicketData && initialTicketData.length > 0) {
      AppLogger.state('TicketModal', 'Updating modal with new API data', 
        { currentLength: ticketData.length }, 
        { newLength: initialTicketData.length, fields: initialTicketData.map(f => f.key) }
      );
      setTicketData(initialTicketData);
    } else {
      AppLogger.modal('TicketModal', 'No valid initialTicketData provided, keeping current state');
    }
  }, [initialTicketData]);

  const handleFieldChange = (key: string, value: string) => {
    setTicketData(prev => 
      prev.map(field => 
        field.key === key ? { ...field, value } : field
      )
    );
  };

  const handleSave = () => {
    const data = ticketData.reduce((acc, field) => {
      acc[field.key] = field.value;
      return acc;
    }, {} as Record<string, unknown>);
    onSave(data);
    setIsEditing(false);
    if (onNavigateToDetails) {
      onNavigateToDetails();
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    onEdit();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this ticket?')) {
      onDelete();
    }
  };

  if (!isOpen) return null;

  // Filter out fields with null, empty, or zero values
  const visibleFields = ticketData.filter(field => {
    const value = field.value;
    return value !== null && value !== '' && value !== 0;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl w-full max-w-screen-sm mx-auto max-h-[90vh] flex flex-col">
        {/* Handle bar */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-6 pb-4">
          <div className="flex items-start gap-4">
            {/* Ticket thumbnail */}
            <div className="w-20 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
              {ticketImage ? (
                <img 
                  src={ticketImage} 
                  alt="Scanned ticket" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <div className="w-8 h-8 bg-gray-300 rounded"></div>
                </div>
              )}
            </div>

            {/* Title and category */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Title</h2>
              <Badge className="bg-green-100 text-green-800 border-green-300">
                ticket_type
              </Badge>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="space-y-4">
            {visibleFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key} className="text-sm font-medium text-gray-700">
                  {field.label}
                </Label>
                {isEditing && field.editable ? (
                  <Input
                    id={field.key}
                    value={field.value?.toString() || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <span className="text-gray-900">
                      {field.type === 'currency' ? `£${field.value}` : field.value}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Raw extracted text section */}
            <div className="mt-6 space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Raw Extracted Text
              </Label>
              <div className="p-3 bg-gray-50 rounded-lg border max-h-40 overflow-y-auto">
                <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                  {extractedText}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between px-6 py-6 border-t border-gray-200">
          {/* Delete button */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleDelete}
              className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
            <span className="text-sm font-medium text-gray-700">Delete</span>
          </div>

          {/* Edit button */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleEdit}
              className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <Edit className="w-6 h-6 text-gray-600" />
            </button>
            <span className="text-sm font-medium text-gray-700">Edit</span>
          </div>

          {/* Save button */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleSave}
              className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors"
            >
              <Save className="w-6 h-6 text-white" />
            </button>
            <span className="text-sm font-medium text-blue-600">Save</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;