// src/crm/ai/aiAgent.ts

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================
// AI AGENT SYSTEM PROMPTS
// ============================================

const RESIDENT_MAINTENANCE_PROMPT = `You are a helpful property management assistant helping residents report maintenance issues.
Your goals:
1. Understand the maintenance issue clearly
2. Determine if it's an emergency (flooding, gas leak, no heat in winter, no AC in extreme heat, fire, etc.)
3. Collect necessary details (location, description, access instructions)
4. Create a maintenance ticket or escalate to manager

Be friendly, professional, and efficient. Keep responses brief (under 160 characters when possible for SMS).

If the issue is an EMERGENCY, respond with: "EMERGENCY_ESCALATE" and describe the issue.
If you have enough information to create a ticket, respond with: "CREATE_TICKET" followed by the details.
If you need more information, ask ONE clarifying question.

Never make promises about timing you can't keep. Use general timeframes:
- Emergency: "We'll contact you within 2 hours"
- Urgent: "We'll address this within 24 hours"  
- Routine: "We'll schedule this within 3 business days"`;

const LEAD_CONVERSION_PROMPT = `You are a leasing assistant helping prospective residents find their perfect home.
Your goals:
1. Answer questions about available units, amenities, pricing
2. Qualify the lead (budget, move-in date, bedrooms needed, pets)
3. Schedule property tours when ready
4. Send application links to qualified leads

Be enthusiastic, helpful, and professional. Highlight features that match their needs.
Keep responses conversational and under 320 characters when possible.

If you don't know specific information, say: "ESCALATE_TO_AGENT" and explain what you need.
If the lead wants to schedule a tour, respond with: "SCHEDULE_TOUR" and confirm their preferred date/time.
If they're ready to apply, respond with: "SEND_APPLICATION".`;

// ============================================
// PROCESS INCOMING MESSAGE
// ============================================
interface ProcessMessageParams {
  messageContent: string;
  residentId?: string;
  leadId?: string;
  organization?: any; // ADD THIS LINE
  conversationHistory: any[];
  context: any;
}

interface AIResponse {
  message: string;
  model: string;
  promptTokens: number;
  responseTokens: number;
  escalated: boolean;
  maintenanceRequestId?: string;
  action?: string;
}

export async function processIncomingMessage(
  params: ProcessMessageParams
): Promise<AIResponse> {
  const { messageContent, residentId, leadId, organization, conversationHistory, context } = params;

  // Determine if this is a resident or lead
  const isResident = !!residentId;
  
  // Select appropriate system prompt
  const systemPrompt = isResident ? RESIDENT_MAINTENANCE_PROMPT : LEAD_CONVERSION_PROMPT;

  // Build conversation context
  const messages: any[] = [
    { role: 'system', content: systemPrompt },
  ];

  // Add recent conversation history
  conversationHistory.slice(-5).reverse().forEach((conv: any) => {
    const role = conv.senderType === 'RESIDENT' || conv.senderType === 'LEAD' ? 'user' : 'assistant';
    messages.push({
      role,
      content: conv.messageContent,
    });
  });

  // Add current message
  messages.push({
    role: 'user',
    content: messageContent,
  });

  // Get additional context - use the organization parameter
  let contextInfo = '';
  
  if (organization) {
    contextInfo = `\n\nContext: Organization - ${organization.name}`;
  }
  
  if (isResident && residentId) {
    const resident = await context.entities.Resident.findUnique({
      where: { id: residentId },
      include: { property: true },
    });
    
    if (resident) {
      contextInfo += `\nResident: ${resident.firstName} ${resident.lastName}, Unit ${resident.unitNumber} at ${resident.property.name}`;
    }
  } else if (leadId) {
    const lead = await context.entities.Lead.findUnique({
      where: { id: leadId },
      include: { interestedProperty: true },
    });
    
    if (lead) {
      contextInfo += `\nLead: ${lead.firstName} ${lead.lastName}`;
      if (lead.interestedProperty) {
        contextInfo += `, interested in ${lead.interestedProperty.name}`;
      }
      if (lead.desiredBedrooms) {
        contextInfo += `, needs ${lead.desiredBedrooms} bedrooms`;
      }
      if (lead.budgetMax) {
        contextInfo += `, budget up to $${lead.budgetMax}`;
      }
    }
  }

  if (contextInfo) {
    messages[0].content += contextInfo;
  }

  // Call OpenAI
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4',
    messages,
    max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500'),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
  });

  const aiMessage = completion.choices[0].message.content || '';
  const usage = completion.usage!;

  // Parse AI response for actions
  let escalated = false;
  let maintenanceRequestId: string | undefined;
  let responseMessage = aiMessage;

  // Handle maintenance request for residents
  if (isResident && residentId) {
    if (aiMessage.includes('EMERGENCY_ESCALATE')) {
      escalated = true;
      responseMessage = "This sounds like an emergency. I'm notifying your property manager immediately. They'll contact you within 2 hours.";
      
      // Auto-create emergency maintenance request
      maintenanceRequestId = await createMaintenanceRequest({
        residentId,
        description: messageContent,
        priority: 'EMERGENCY',
        context,
      });
    } else if (aiMessage.includes('CREATE_TICKET')) {
      // Extract intent to determine priority and type
      const intent = analyzeMaintenanceIntent(messageContent);
      
      maintenanceRequestId = await createMaintenanceRequest({
        residentId,
        description: messageContent,
        priority: intent.priority,
        requestType: intent.type,
        context,
      });
      
      responseMessage = aiMessage.replace('CREATE_TICKET', '').trim() || 
        `I've created a maintenance request for you. Our team will address this ${intent.priority === 'HIGH' ? 'within 24 hours' : 'within 3 business days'}. Ticket #${maintenanceRequestId.slice(-6)}`;
    }
  }

  // Handle lead actions
  if (!isResident && leadId) {
    if (aiMessage.includes('ESCALATE_TO_AGENT')) {
      escalated = true;
      responseMessage = "Great question! Let me connect you with a leasing agent who can provide specific details. They'll reach out shortly.";
    } else if (aiMessage.includes('SCHEDULE_TOUR')) {
      responseMessage = aiMessage.replace('SCHEDULE_TOUR', '').trim() || 
        "I'd love to schedule a tour for you! What date and time work best? I can do weekdays 9am-6pm or weekends 10am-4pm.";
      
      // Update lead status
      await context.entities.Lead.update({
        where: { id: leadId },
        data: { status: 'TOURING_SCHEDULED' },
      });
    } else if (aiMessage.includes('SEND_APPLICATION')) {
      responseMessage = "Excellent! I'll send you our application link. You can complete it online in about 10 minutes. Application link: [LINK_TO_APPLICATION]";
      
      await context.entities.Lead.update({
        where: { id: leadId },
        data: { status: 'APPLIED' },
      });
    }
  }

  return {
    message: responseMessage,
    model: completion.model,
    promptTokens: usage.prompt_tokens,
    responseTokens: usage.completion_tokens,
    escalated,
    maintenanceRequestId,
  };
}

// ============================================
// ANALYZE MAINTENANCE INTENT
// ============================================
function analyzeMaintenanceIntent(message: string): {
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  type: string;
} {
  const messageLower = message.toLowerCase();

  // Emergency keywords
  const emergencyKeywords = ['flood', 'fire', 'gas leak', 'no heat', 'no water', 'broken pipe', 'emergency'];
  if (emergencyKeywords.some(keyword => messageLower.includes(keyword))) {
    return { priority: 'EMERGENCY', type: 'EMERGENCY' };
  }

  // High priority keywords
  const highPriorityKeywords = ['leak', 'not working', 'broken', 'no hot water'];
  if (highPriorityKeywords.some(keyword => messageLower.includes(keyword))) {
    return { priority: 'HIGH', type: determineType(messageLower) };
  }

  // Medium priority is default
  return { priority: 'MEDIUM', type: determineType(messageLower) };
}

function determineType(message: string): string {
  if (message.includes('plumb') || message.includes('toilet') || message.includes('sink') || message.includes('leak')) {
    return 'PLUMBING';
  }
  if (message.includes('heat') || message.includes('ac') || message.includes('air') || message.includes('hvac')) {
    return 'HVAC';
  }
  if (message.includes('electric') || message.includes('outlet') || message.includes('light')) {
    return 'ELECTRICAL';
  }
  if (message.includes('appliance') || message.includes('fridge') || message.includes('stove') || message.includes('dishwasher')) {
    return 'APPLIANCE';
  }
  if (message.includes('pest') || message.includes('bug') || message.includes('roach') || message.includes('mouse')) {
    return 'PEST_CONTROL';
  }
  return 'GENERAL';
}

// ============================================
// CREATE MAINTENANCE REQUEST
// ============================================
async function createMaintenanceRequest(params: {
  residentId: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  requestType?: string;
  context: any;
}): Promise<string> {
  const { residentId, description, priority, requestType = 'GENERAL', context } = params;

  const resident = await context.entities.Resident.findUnique({
    where: { id: residentId },
  });

  if (!resident) {
    throw new Error('Resident not found');
  }

  const maintenanceRequest = await context.entities.MaintenanceRequest.create({
    data: {
      residentId,
      propertyId: resident.propertyId,
      unitNumber: resident.unitNumber,
      requestType,
      title: `${requestType.replace('_', ' ')} - Auto-created from SMS`,
      description,
      priority,
      status: 'SUBMITTED',
      organizationId: resident.organizationId,
    },
  });

  return maintenanceRequest.id;
}

// ============================================
// GENERATE AI RESPONSE (Manual)
// ============================================
export async function generateAIResponse(
  messageContent: string,
  conversationContext: any[]
): Promise<string> {
  const messages: any[] = [
    { role: 'system', content: 'You are a helpful property management assistant.' },
  ];

  conversationContext.forEach((conv: any) => {
    messages.push({
      role: conv.role || 'user',
      content: conv.content,
    });
  });

  messages.push({
    role: 'user',
    content: messageContent,
  });

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4',
    messages,
    max_tokens: 500,
  });

  return completion.choices[0].message.content || '';
}
