// app/src/vapi/vapiClient.ts
import { HttpError } from 'wasp/server';

const VAPI_API_URL = 'https://api.vapi.ai';
const VAPI_API_KEY = process.env.VAPI_API_KEY;

if (!VAPI_API_KEY) {
  console.warn('⚠️ VAPI_API_KEY not set in environment variables');
}

// ============================================
// VAPI CLIENT
// ============================================

class VapiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || VAPI_API_KEY || '';
    this.baseUrl = VAPI_API_URL;
  }

  // ============================================
  // PHONE NUMBERS
  // ============================================

  /**
   * Get available phone numbers
   */
  async getAvailablePhoneNumbers(areaCode?: string): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (areaCode) {
        params.append('areaCode', areaCode);
      }

      const response = await this.makeRequest(
        'GET',
        `/phone-number/available?${params.toString()}`
      );

      return response.phoneNumbers || [];
    } catch (error) {
      console.error('Failed to get available phone numbers:', error);
      throw new HttpError(500, 'Failed to fetch available phone numbers');
    }
  }

  /**
   * Purchase a phone number
   */
  async purchasePhoneNumber(phoneNumber: string): Promise<any> {
    try {
      const response = await this.makeRequest('POST', '/phone-number', {
        phoneNumber,
        provider: 'twilio', // or 'vonage'
      });

      return response;
    } catch (error) {
      console.error('Failed to purchase phone number:', error);
      throw new HttpError(500, 'Failed to purchase phone number');
    }
  }

  /**
   * Update phone number configuration
   */
  async updatePhoneNumber(
    phoneNumberId: string,
    config: {
      assistantId?: string;
      name?: string;
    }
  ): Promise<any> {
    try {
      const response = await this.makeRequest('PATCH', `/phone-number/${phoneNumberId}`, config);
      return response;
    } catch (error) {
      console.error('Failed to update phone number:', error);
      throw new HttpError(500, 'Failed to update phone number');
    }
  }

  /**
   * Release (delete) a phone number
   */
  async releasePhoneNumber(phoneNumberId: string): Promise<void> {
    try {
      await this.makeRequest('DELETE', `/phone-number/${phoneNumberId}`);
    } catch (error) {
      console.error('Failed to release phone number:', error);
      throw new HttpError(500, 'Failed to release phone number');
    }
  }

  // ============================================
  // ASSISTANTS
  // ============================================

  /**
   * Create an AI assistant
   */
  async createAssistant(config: {
    name: string;
    model: {
      provider: 'openai' | 'anthropic';
      model: string;
      temperature?: number;
      systemPrompt: string;
    };
    voice: {
      provider: '11labs' | 'playht' | 'deepgram';
      voiceId: string;
    };
    firstMessage: string;
    serverUrl: string;
    serverUrlSecret: string;
    functions: any[];
    endCallFunctionEnabled?: boolean;
    recordingEnabled?: boolean;
    transcriptPlan?: {
      enabled: boolean;
      provider: 'deepgram' | 'gladia';
    };
  }): Promise<any> {
    try {
      const response = await this.makeRequest('POST', '/assistant', config);
      return response;
    } catch (error) {
      console.error('Failed to create assistant:', error);
      throw new HttpError(500, 'Failed to create AI assistant');
    }
  }

  /**
   * Update an AI assistant
   */
  async updateAssistant(assistantId: string, config: Partial<any>): Promise<any> {
    try {
      const response = await this.makeRequest('PATCH', `/assistant/${assistantId}`, config);
      return response;
    } catch (error) {
      console.error('Failed to update assistant:', error);
      throw new HttpError(500, 'Failed to update AI assistant');
    }
  }

  /**
   * Get assistant details
   */
  async getAssistant(assistantId: string): Promise<any> {
    try {
      const response = await this.makeRequest('GET', `/assistant/${assistantId}`);
      return response;
    } catch (error) {
      console.error('Failed to get assistant:', error);
      throw new HttpError(500, 'Failed to fetch AI assistant');
    }
  }

  /**
   * Delete an AI assistant
   */
  async deleteAssistant(assistantId: string): Promise<void> {
    try {
      await this.makeRequest('DELETE', `/assistant/${assistantId}`);
    } catch (error) {
      console.error('Failed to delete assistant:', error);
      throw new HttpError(500, 'Failed to delete AI assistant');
    }
  }

  // ============================================
  // CALLS
  // ============================================

  /**
   * Make an outbound call
   */
  async makeCall(config: {
    assistantId: string;
    phoneNumberId: string;
    customer: {
      number: string;
      name?: string;
    };
  }): Promise<any> {
    try {
      const response = await this.makeRequest('POST', '/call', config);
      return response;
    } catch (error) {
      console.error('Failed to make call:', error);
      throw new HttpError(500, 'Failed to initiate call');
    }
  }

  /**
   * Get call details
   */
  async getCall(callId: string): Promise<any> {
    try {
      const response = await this.makeRequest('GET', `/call/${callId}`);
      return response;
    } catch (error) {
      console.error('Failed to get call:', error);
      throw new HttpError(500, 'Failed to fetch call details');
    }
  }

  /**
   * List calls
   */
  async listCalls(filters?: {
    assistantId?: string;
    limit?: number;
    createdAtGt?: string;
    createdAtLt?: string;
  }): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.assistantId) params.append('assistantId', filters.assistantId);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.createdAtGt) params.append('createdAtGt', filters.createdAtGt);
      if (filters?.createdAtLt) params.append('createdAtLt', filters.createdAtLt);

      const response = await this.makeRequest('GET', `/call?${params.toString()}`);
      return response.calls || [];
    } catch (error) {
      console.error('Failed to list calls:', error);
      throw new HttpError(500, 'Failed to fetch calls');
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private async makeRequest(method: string, endpoint: string, body?: any): Promise<any> {
    if (!this.apiKey) {
      throw new HttpError(500, 'Vapi API key not configured');
    }

    const url = `${this.baseUrl}${endpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    };

    if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        console.error(`Vapi API error [${method} ${endpoint}]:`, error);
        throw new Error(error.message || `Request failed with status ${response.status}`);
      }

      // DELETE requests may not return a body
      if (method === 'DELETE' || response.status === 204) {
        return {};
      }

      return await response.json();
    } catch (error: any) {
      console.error(`Vapi API request failed [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // Implement signature verification using crypto
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const vapiClient = new VapiClient();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Build AI assistant system prompt for a property
 */
export function buildAssistantSystemPrompt(property: {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  businessHoursStart?: string;
  businessHoursEnd?: string;
  emergencyPhone?: string;
  aiInstructions?: string;
}): string {
  const basePrompt = `You are an AI assistant for ${property.name}, a residential property management company. 

Your role is to help residents and prospective tenants with:
- Maintenance requests (plumbing, HVAC, electrical, etc.)
- Property tours and leasing information
- Rent payment questions
- General property information

Property Details:
- Name: ${property.name}
- Address: ${property.address || 'Not specified'}, ${property.city || ''}, ${property.state || ''}
- Business Hours: ${property.businessHoursStart || '9AM'} - ${property.businessHoursEnd || '5PM'}
${property.emergencyPhone ? `- Emergency Contact: ${property.emergencyPhone}` : ''}

Guidelines:
- Be professional, friendly, and helpful
- Ask clarifying questions to understand the caller's needs
- For maintenance requests: get unit number, issue type, description, and urgency
- For property tours: get name, contact info, preferred date/time, and unit preferences
- Always confirm details before creating tickets or scheduling appointments
- If you can't help, offer to transfer to a human staff member

${property.aiInstructions || ''}`;

  return basePrompt;
}

/**
 * Build function definitions for Vapi assistant
 */
export function buildAssistantFunctions(): any[] {
  return [
    {
      name: 'create_maintenance_request',
      description: 'Create a maintenance request when a resident reports an issue',
      parameters: {
        type: 'object',
        properties: {
          unitNumber: {
            type: 'string',
            description: "The resident's unit number",
          },
          issueType: {
            type: 'string',
            enum: ['PLUMBING', 'HVAC', 'ELECTRICAL', 'APPLIANCE', 'GENERAL', 'EMERGENCY', 'PEST_CONTROL', 'LANDSCAPING', 'SECURITY', 'OTHER'],
            description: 'Type of maintenance issue',
          },
          description: {
            type: 'string',
            description: 'Detailed description of the issue',
          },
          urgency: {
            type: 'string',
            enum: ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'],
            description: 'Urgency level',
          },
          preferredTime: {
            type: 'string',
            description: 'Preferred appointment time (optional)',
          },
        },
        required: ['unitNumber', 'issueType', 'description', 'urgency'],
      },
    },
    {
      name: 'schedule_property_tour',
      description: 'Schedule a property tour for a prospective tenant',
      parameters: {
        type: 'object',
        properties: {
          prospectName: {
            type: 'string',
            description: "Prospect's full name",
          },
          prospectEmail: {
            type: 'string',
            description: "Prospect's email address",
          },
          prospectPhone: {
            type: 'string',
            description: "Prospect's phone number",
          },
          tourDate: {
            type: 'string',
            description: 'Preferred tour date (YYYY-MM-DD)',
          },
          tourTime: {
            type: 'string',
            description: 'Preferred tour time (HH:MM)',
          },
          unitType: {
            type: 'string',
            description: "Type of unit interested in (e.g., '2-bedroom')",
          },
          budgetMax: {
            type: 'number',
            description: 'Maximum budget (optional)',
          },
        },
        required: ['prospectName', 'prospectPhone', 'tourDate', 'tourTime'],
      },
    },
    {
      name: 'check_rent_balance',
      description: "Check a resident's rent payment status and balance",
      parameters: {
        type: 'object',
        properties: {
          unitNumber: {
            type: 'string',
            description: "The resident's unit number",
          },
        },
        required: ['unitNumber'],
      },
    },
    {
      name: 'escalate_to_human',
      description: 'Transfer call to a human staff member',
      parameters: {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            description: 'Reason for escalation',
          },
          urgency: {
            type: 'string',
            enum: ['LOW', 'MEDIUM', 'HIGH'],
            description: 'Urgency of escalation',
          },
        },
        required: ['reason'],
      },
    },
  ];
}

export default vapiClient;
