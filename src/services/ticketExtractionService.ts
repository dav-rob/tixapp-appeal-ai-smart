/**
 * Ticket Extraction Service
 * Handles API calls to extract structured ticket data from OCR text
 */

interface TicketExtractionResponse {
  ticket_category: string;
  pcn_number?: string;
  car_vrm?: string;
  contravention_code?: string;
  contravention_datetime?: string;
  date_of_notice?: string;
  contravention_code_suffix?: string;
  contravention_description?: string;
  council?: string;
  location?: string;
  geo_lat?: number;
  geo_lng?: number;
  ceo_code?: string;
  observation_period?: string;
  car_make?: string;
  car_model?: string;
  car_colour?: string;
  source_file?: string;
  extraction_timestamp?: string;
  llm_tokens_used?: number;
  llm_cost?: number;
}

interface TicketExtractionRequest {
  ocr_text: string;
}

class TicketExtractionService {
  private readonly apiKey: string;

  constructor() {
    // Get API key from environment variables
    this.apiKey = import.meta.env.VITE_CURRENT_CUSTOM_API_KEY || '';
    
    console.log('TicketExtractionService initialized:', {
      hasApiKey: !!this.apiKey,
      envMode: import.meta.env.MODE,
      isDev: import.meta.env.DEV
    });
    
    if (!this.apiKey) {
      console.error('VITE_CURRENT_CUSTOM_API_KEY not found in environment variables');
    }
  }

  private getApiUrl(): string {
    // Check if running in mobile app (Capacitor)
    const isCapacitor = !!(window as any).Capacitor;
    const isDev = import.meta.env.DEV;
    
    console.log('getApiUrl - Platform detection:', {
      isCapacitor,
      isDev,
      platform: isCapacitor ? (window as any).Capacitor?.getPlatform?.() : 'web'
    });
    
    // Use proxy only for web development, not mobile apps
    if (isDev && !isCapacitor) {
      console.log('Using development proxy: /api/extract_ticket');
      return '/api/extract_ticket';
    }
    
    // Use direct API URL for production or mobile apps
    console.log('Using direct API URL: https://api.tixappeal.com/extract_ticket');
    return 'https://api.tixappeal.com/extract_ticket';
  }

  /**
   * Extract structured ticket data from OCR text
   * @param ocrText - Raw OCR text from ticket scanning
   * @returns Promise<TicketExtractionResponse> - Structured ticket data
   */
  async extractTicketData(ocrText: string): Promise<TicketExtractionResponse> {
    if (!this.apiKey) {
      throw new Error('API key not configured');
    }

    if (!ocrText || ocrText.trim().length === 0) {
      throw new Error('OCR text is required');
    }

    const requestBody: TicketExtractionRequest = {
      ocr_text: ocrText.trim()
    };

    const apiUrl = this.getApiUrl(); // Get URL dynamically
    
    try {
      console.log('Calling ticket extraction API...', {
        url: apiUrl,
        ocrTextLength: ocrText.length,
        hasApiKey: !!this.apiKey
      });

      // Check if we're running in a Capacitor environment
      const isCapacitor = !!(window as any).Capacitor;
      
      if (isCapacitor) {
        // Use Capacitor's native HTTP for mobile apps (bypasses CORS)
        console.log('Using Capacitor native HTTP');
        const { CapacitorHttp } = await import('@capacitor/core');
        
        const response = await CapacitorHttp.post({
          url: apiUrl,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          data: requestBody,
          // Add 8 second timeout to prevent hanging (mobile networks)
          timeout: 8000
        });

        console.log('Capacitor HTTP response received:', {
          status: response.status,
          statusText: response.statusText,
          dataType: typeof response.data,
          dataPreview: JSON.stringify(response.data).substring(0, 200)
        });

        if (response.status < 200 || response.status >= 300) {
          const errorText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
          console.error('API error response:', errorText);
          throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data: TicketExtractionResponse = response.data;
        console.log('Ticket extraction successful via Capacitor HTTP:', {
          dataType: typeof data,
          keys: Object.keys(data || {}),
          ticketCategory: data?.ticket_category,
          pcnNumber: data?.pcn_number,
          fullData: data
        });
        return data;
        
      } else {
        // Use regular fetch for web (with proxy)
        console.log('Using regular fetch for web');
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify(requestBody)
        });

        console.log('Fetch response received:', {
          status: response.status,
          statusText: response.statusText
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data: TicketExtractionResponse = await response.json();
        console.log('Ticket extraction successful via fetch:', data);
        return data;
      }

    } catch (error) {
      console.error('Error extracting ticket data:', error);
      
      // Enhanced error reporting
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Network error: ${error.message}`);
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to extract ticket data: ${error.message}`);
      } else {
        throw new Error('Failed to extract ticket data: Unknown error');
      }
    }
  }

  /**
   * Convert API response to display format for the modal
   * @param apiData - Raw API response data
   * @returns Array of formatted field objects for display
   */
  formatTicketDataForDisplay(apiData: TicketExtractionResponse) {
    // Access nested ticket_data object from API response
    const ticketData = apiData.ticket_data;
    
    const fields = [
      { key: 'ticket_category', label: 'Ticket Category', value: ticketData?.ticket_category, type: 'text' as const, editable: true },
      { key: 'pcn_number', label: 'PCN Number', value: ticketData?.pcn_number, type: 'text' as const, editable: true },
      { key: 'car_vrm', label: 'Vehicle Registration', value: ticketData?.car_vrm, type: 'text' as const, editable: true },
      { key: 'contravention_code', label: 'Contravention Code', value: ticketData?.contravention_code, type: 'text' as const, editable: true },
      { key: 'contravention_datetime', label: 'Date of Contravention', value: ticketData?.contravention_datetime, type: 'datetime' as const, editable: true },
      { key: 'date_of_notice', label: 'Date of Notice', value: ticketData?.date_of_notice, type: 'datetime' as const, editable: true },
      { key: 'contravention_code_suffix', label: 'Code Suffix', value: ticketData?.contravention_code_suffix, type: 'text' as const, editable: true },
      { key: 'contravention_description', label: 'Description', value: ticketData?.contravention_description, type: 'text' as const, editable: true },
      { key: 'council', label: 'Council', value: ticketData?.council, type: 'text' as const, editable: true },
      { key: 'location', label: 'Location', value: ticketData?.location, type: 'text' as const, editable: true },
      { key: 'geo_lat', label: 'Latitude', value: ticketData?.geo_lat, type: 'number' as const, editable: true },
      { key: 'geo_lng', label: 'Longitude', value: ticketData?.geo_lng, type: 'number' as const, editable: true },
      { key: 'ceo_code', label: 'CEO Code', value: ticketData?.ceo_code, type: 'text' as const, editable: true },
      { key: 'observation_period', label: 'Observation Period', value: ticketData?.observation_period, type: 'text' as const, editable: true },
      { key: 'car_make', label: 'Vehicle Make', value: ticketData?.car_make, type: 'text' as const, editable: true },
      { key: 'car_model', label: 'Vehicle Model', value: ticketData?.car_model, type: 'text' as const, editable: true },
      { key: 'car_colour', label: 'Vehicle Colour', value: ticketData?.car_colour, type: 'text' as const, editable: true },
    ];

    // Filter out fields with null, empty, or zero values
    return fields.filter(field => {
      const value = field.value;
      return value !== null && value !== undefined && value !== '' && value !== 0;
    });
  }
}

// Export singleton instance
export const ticketExtractionService = new TicketExtractionService();
export type { TicketExtractionResponse };