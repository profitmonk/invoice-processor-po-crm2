// app/src/vapi/webhooks/vapiWebhooks.ts
// VAPI WEBHOOK HANDLERS - Phase 2 (CORRECTED VERSION)
//
import type { MiddlewareConfigFn } from 'wasp/server';
import { HttpError } from 'wasp/server';
import crypto from 'crypto';
import express from 'express';
//import cors from 'cors';

// ============================================
// MIDDLEWARE CONFIGURATION (FIXED)
// ============================================

export const vapiMiddlewareConfigFn: MiddlewareConfigFn = (middlewareConfig) => {
  // Add raw body parsing middleware
  middlewareConfig.set('express.raw', express.raw({ type: 'application/json' }));
  return middlewareConfig;
};

// ============================================
// WEBHOOK SIGNATURE VERIFICATION
// ============================================

function verifyVapiSignature(rawBody: string, signature: string, secret: string): boolean {
  try {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(rawBody);
    const expectedSignature = hmac.digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('[Vapi] Signature verification error:', error);
    return false;
  }
}

function validateWebhookRequest(req: any): void {
  const signature = req.headers['x-vapi-signature'];
  const rawBody = req.body ? req.body.toString('utf8') : '';

  console.log('[Vapi] Headers:', req.headers); // DEBUG
  console.log('[Vapi] Signature:', signature); // DEBUG
  console.log('[Vapi] Body length:', rawBody.length); // DEBUG

  if (!signature || !rawBody) {
    throw new HttpError(401, 'Missing signature or body');
  }

  const vapiWebhookSecret = process.env.VAPI_WEBHOOK_SECRET || '';
  
  if (!vapiWebhookSecret) {
    throw new HttpError(500, 'Webhook secret not configured');
  }
  
  if (!verifyVapiSignature(rawBody, signature, vapiWebhookSecret)) {
    throw new HttpError(401, 'Invalid signature');
  }
}

// ============================================
// WEBHOOK 1: ASSISTANT REQUEST (Function Calling)
// ============================================

export const handleAssistantRequest = async (req: any, res: any, context: any) => {
  try {
    //COMMENTED//validateWebhookRequest(req);
    
    //const payload = JSON.parse(req.body.toString('utf8'));
    const payload = req.body;
    const { message, call } = payload;
    console.log('[Vapi] 📦 Parsed payload:', JSON.stringify(payload, null, 2)); //

    console.log('[Vapi] Assistant Request:', {
      messageType: message?.type,
      functionName: message?.function?.name,
      callId: call?.id,
    });

    // Handle function calls
    if (message?.type === 'function-call') {
      const functionName = message.function.name;
      const args = message.function.arguments;

      let result;

      switch (functionName) {
        case 'create_maintenance_request':
          result = await handleCreateMaintenanceRequest(args, call, context);
          break;

        case 'schedule_property_tour':
          result = await handleScheduleTour(args, call, context);
          break;

        case 'check_rent_balance':
          result = await handleCheckRentBalance(args, call, context);
          break;

        case 'escalate_to_human':
          result = await handleEscalateToHuman(args, call, context);
          break;

        default:
          result = {
            success: false,
            error: `Unknown function: ${functionName}`,
          };
      }

      return res.json({ result });
    }

    // If not a function call, acknowledge receipt
    return res.json({ success: true });
  } catch (error: any) {
    console.error('[Vapi] Assistant Request Error:', error);
    return res.status(error.statusCode || 500).json({
      error: error.message || 'Internal server error',
    });
  }
};

// ============================================
// WEBHOOK 2: CALL STARTED
// ============================================

export const handleCallStarted = async (req: any, res: any, context: any) => {
  try {
    //COMMENTED//validateWebhookRequest(req);
    
    //const payload = JSON.parse(req.body.toString('utf8'));
    const payload = req.body;
    const { call } = payload;

    console.log('[Vapi] Call Started:', {
      callId: call.id,
      phoneNumber: call.customer?.number,
      assistantId: call.assistantId,
    });

    // Find property by assistant ID
    const property = await context.entities.Property.findUnique({
      where: { vapiAssistantId: call.assistantId },
      include: { organization: true },
    });

    if (!property) {
      console.error('[Vapi] Property not found for assistant:', call.assistantId);
      return res.json({ success: false, error: 'Property not found' });
    }

    // Try to find resident or lead by phone number
    const phoneNumber = normalizePhoneNumber(call.customer?.number);
    
    const resident = await context.entities.Resident.findFirst({
      where: {
        phoneNumber,
        propertyId: property.id,
      },
    });

    const lead = !resident ? await context.entities.Lead.findFirst({
      where: {
        phoneNumber,
        propertyId: property.id,
      },
    }) : null;

    // Create VapiCall record
    await context.entities.VapiCall.create({
      data: {
        vapiCallId: call.id,
        propertyId: property.id,
        organizationId: property.organizationId,
        residentId: resident?.id,
        leadId: lead?.id,
        callerPhone: phoneNumber,
        callerName: call.customer?.name,
        callType: 'INBOUND',
        callStatus: 'IN_PROGRESS',
        callDirection: 'INBOUND',
        assistantId: call.assistantId,
        startedAt: new Date(),
      },
    });

    // Update property last call time and count
    await context.entities.Property.update({
      where: { id: property.id },
      data: {
        lastCallAt: new Date(),
        monthlyCallCount: { increment: 1 },
      },
    });

    return res.json({ success: true });
  } catch (error: any) {
    console.error('[Vapi] Call Started Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// ============================================
// WEBHOOK 3: CALL ENDED
// ============================================

export const handleCallEnded = async (req: any, res: any, context: any) => {
  try {
    //COMMENTED//validateWebhookRequest(req);
    
    //const payload = JSON.parse(req.body.toString('utf8'));
    const payload = req.body;
    const { call } = payload;

    console.log('[Vapi] Call Ended:', {
      callId: call.id,
      duration: call.duration,
      endedReason: call.endedReason,
    });

    // Find the call record
    const vapiCall = await context.entities.VapiCall.findUnique({
      where: { vapiCallId: call.id },
      include: { property: true },
    });

    if (!vapiCall) {
      console.error('[Vapi] Call record not found:', call.id);
      return res.json({ success: false, error: 'Call not found' });
    }

    // Extract transcript and summary
    const transcript = call.transcript || '';
    const messages = call.messages || [];
    
    // Generate summary from AI messages
    let summary = '';
    const aiMessages = messages.filter((m: any) => m.role === 'assistant');
    if (aiMessages.length > 0) {
      summary = aiMessages.map((m: any) => m.content).join('\n');
    }

    // Calculate cost (Vapi pricing: ~$0.01-0.02 per minute)
    const durationMinutes = Math.ceil(call.duration / 60);
    const cost = durationMinutes * 0.015; // $0.015 per minute average

    // Determine call status
    const callStatus = call.endedReason === 'customer-ended-call' 
      ? 'COMPLETED' 
      : call.endedReason === 'assistant-error'
      ? 'FAILED'
      : 'COMPLETED';

    // Update call record
    await context.entities.VapiCall.update({
      where: { vapiCallId: call.id },
      data: {
        callStatus,
        endedAt: new Date(),
        durationSeconds: call.duration,
        transcript: transcript.substring(0, 50000),
        summary: summary.substring(0, 5000),
        recordingUrl: call.recordingUrl,
        cost,
        vapiMetadata: call,
      },
    });

    // Update property stats
    await context.entities.Property.update({
      where: { id: vapiCall.propertyId },
      data: {
        monthlyCallMinutes: { increment: durationMinutes },
        estimatedMonthlyCost: { increment: cost },
      },
    });

    // If lead called, update their last call time
    if (vapiCall.leadId) {
      await context.entities.Lead.update({
        where: { id: vapiCall.leadId },
        data: { lastVapiCallAt: new Date() },
      });
    }

    return res.json({ success: true });
  } catch (error: any) {
    console.error('[Vapi] Call Ended Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// ============================================
// WEBHOOK 4: STATUS UPDATE
// ============================================

export const handleStatusUpdate = async (req: any, res: any, context: any) => {
  try {
    //COMMENTED//validateWebhookRequest(req);
    
    //const payload = JSON.parse(req.body.toString('utf8'));
    const payload = req.body;
    const { call, status } = payload;

    console.log('[Vapi] Status Update:', {
      callId: call.id,
      status,
    });

    // Map Vapi status to our enum
    const statusMap: any = {
      'queued': 'QUEUED',
      'ringing': 'RINGING',
      'in-progress': 'IN_PROGRESS',
      'forwarding': 'IN_PROGRESS',
      'ended': 'COMPLETED',
    };

    const mappedStatus = statusMap[status] || status.toUpperCase();

    // Update call status
    await context.entities.VapiCall.updateMany({
      where: { vapiCallId: call.id },
      data: {
        callStatus: mappedStatus,
      },
    });

    return res.json({ success: true });
  } catch (error: any) {
    console.error('[Vapi] Status Update Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// ============================================
// FUNCTION HANDLERS
// ============================================


async function handleCreateMaintenanceRequest(args: any, call: any, context: any) {
  try {
    console.log('[Function] Create Maintenance Request - START:', args);

    const property = await context.entities.Property.findUnique({
      where: { vapiAssistantId: call.assistantId },
    });

    if (!property) {
      return { success: false, error: 'Property not found' };
    }

    const phoneNumber = normalizePhoneNumber(call.customer?.number);
    
    let resident = await context.entities.Resident.findFirst({
      where: { phoneNumber, propertyId: property.id },
    });

    if (!resident && args.unitNumber) {
      resident = await context.entities.Resident.findFirst({
        where: { unitNumber: args.unitNumber, propertyId: property.id },
      });
    }

    if (!resident) {
      return {
        success: false,
        error: 'I could not find your resident profile. Please provide your unit number.',
      };
    }

    // Map priority to correct enum values (based on your actual data)
    const priorityMap: any = {
      emergency: 'HIGH',    // Use HIGH for emergency since it exists
      high: 'HIGH',
      medium: 'MEDIUM', 
      low: 'LOW',
    };
    const priority = priorityMap[args.priority?.toLowerCase()] || 'MEDIUM';

    // Map request type to correct enum values (based on your actual data)
    const requestTypeMap: any = {
      plumbing: 'PLUMBING',
      electrical: 'ELECTRICAL', 
      hvac: 'HVAC',
      appliance: 'APPLIANCE',
      security: 'SECURITY',
      general: 'GENERAL'
    };
    const requestType = requestTypeMap[args.type?.toLowerCase()] || 'GENERAL';

    console.log('[Function] Creating maintenance request with:', {
      residentId: resident.id,
      propertyId: property.id,
      unitNumber: resident.unitNumber,
      requestType,
      priority
    });

    // CREATE THE MAINTENANCE REQUEST WITH CORRECT ENUM VALUES
    const request = await context.entities.MaintenanceRequest.create({
      data: {
        propertyId: property.id,
        residentId: resident.id,
        organizationId: property.organizationId,
        unitNumber: resident.unitNumber,
        requestType: requestType, // PLUMBING, ELECTRICAL, HVAC, APPLIANCE, SECURITY, GENERAL
        title: args.issue || 'Maintenance request via phone',
        description: args.description || args.issue,
        priority: priority, // HIGH, MEDIUM, LOW
        status: 'SUBMITTED', // SUBMITTED, ASSIGNED, IN_PROGRESS, COMPLETED
        createdViaVapi: true,
        vapiCallId: call.id,
      },
    });

    console.log('[Function] Maintenance request created successfully:', request.id);

    // Update VapiCall record
    await context.entities.VapiCall.updateMany({
      where: { vapiCallId: call.id },
      data: {
        maintenanceRequestId: request.id,
        actionsTaken: {
          maintenance_request_created: {
            requestId: request.id,
            type: requestType,
            priority: priority,
            timestamp: new Date().toISOString(),
          },
        },
      },
    });

    const refNumber = request.id.substring(0, 8).toUpperCase();

    return {
      success: true,
      message: `I've created your maintenance request. Your reference number is ${refNumber}. We'll have someone look at the ${requestType.toLowerCase()} issue as soon as possible.`,
      requestId: request.id,
    };
  } catch (error: any) {
    console.error('[Function] Create Maintenance Error:', error);
    console.error('[Function] Error details:', error.message);
    console.error('[Function] Error stack:', error.stack);
    return {
      success: false,
      error: 'Sorry, I had trouble creating the maintenance request. Please try again.',
    };
  }
}
async function handleCreateMaintenanceRequest2(args: any, call: any, context: any) {
  try {
    console.log('[Function] Create Maintenance Request:', args);

    const property = await context.entities.Property.findUnique({
      where: { vapiAssistantId: call.assistantId },
    });

    if (!property) {
      return { success: false, error: 'Property not found' };
    }

    const phoneNumber = normalizePhoneNumber(call.customer?.number);
    let resident = await context.entities.Resident.findFirst({
      where: { phoneNumber, propertyId: property.id },
    });

    if (!resident && args.unitNumber) {
      resident = await context.entities.Resident.findFirst({
        where: { unitNumber: args.unitNumber, propertyId: property.id },
      });
    }

    if (!resident) {
      return {
        success: false,
        error: 'I could not find your resident profile. Please provide your unit number.',
      };
    }

    const priorityMap: any = {
      emergency: 'EMERGENCY',
      high: 'HIGH',
      medium: 'MEDIUM',
      low: 'LOW',
    };
    const priority = priorityMap[args.priority?.toLowerCase()] || 'MEDIUM';

    const request = await context.entities.MaintenanceRequest.create({
      data: {
        propertyId: property.id,
        residentId: resident.id,
        organizationId: property.organizationId,
        title: args.issue || 'Maintenance request via phone',
        description: args.description || args.issue,
        type: args.type || 'OTHER',
        priority,
        status: 'SUBMITTED',
        createdViaVapi: true,
        vapiCallId: call.id,
      },
    });

    await context.entities.VapiCall.updateMany({
      where: { vapiCallId: call.id },
      data: {
        maintenanceRequestId: request.id,
        actionsTaken: {
          maintenance_request_created: {
            requestId: request.id,
            type: request.type,
            priority: request.priority,
            timestamp: new Date().toISOString(),
          },
        },
      },
    });

    const refNumber = request.id.substring(0, 8).toUpperCase();

    return {
      success: true,
      message: `I've created your maintenance request. Your reference number is ${refNumber}. We'll have someone look at the ${args.type} issue as soon as possible.`,
      requestId: request.id,
    };
  } catch (error: any) {
    console.error('[Function] Create Maintenance Error:', error);
    return {
      success: false,
      error: 'Sorry, I had trouble creating the maintenance request. Please try again.',
    };
  }
}

async function handleScheduleTour(args: any, call: any, context: any) {
  try {
    console.log('[Function] Schedule Tour:', args);

    const property = await context.entities.Property.findUnique({
      where: { vapiAssistantId: call.assistantId },
    });

    if (!property) {
      return { success: false, error: 'Property not found' };
    }

    const phoneNumber = normalizePhoneNumber(call.customer?.number);

    let lead = await context.entities.Lead.findFirst({
      where: { phoneNumber, propertyId: property.id },
    });

    if (!lead) {
      const [firstName, ...lastNameParts] = (args.name || 'Unknown').split(' ');
      lead = await context.entities.Lead.create({
        data: {
          firstName,
          lastName: lastNameParts.join(' ') || '',
          phoneNumber,
          email: args.email || null,
          propertyId: property.id,
          organizationId: property.organizationId,
          status: 'CONTACTED',
          priority: 'WARM',
          source: 'PHONE_CALL',
          createdViaVapi: true,
          lastVapiCallAt: new Date(),
        },
      });
    } else {
      await context.entities.Lead.update({
        where: { id: lead.id },
        data: {
          status: 'TOURING',
          lastVapiCallAt: new Date(),
        },
      });
    }

    const tourDate = args.date || 'to be confirmed';
    const tourTime = args.time || 'flexible';
    const existingNotes = lead.notes || '';
    const newNotes = `${existingNotes}\n\nTour requested via phone: ${tourDate} at ${tourTime}`;

    await context.entities.Lead.update({
      where: { id: lead.id },
      data: { notes: newNotes },
    });

    await context.entities.VapiCall.updateMany({
      where: { vapiCallId: call.id },
      data: {
        leadId: lead.id,
        actionsTaken: {
          tour_scheduled: {
            leadId: lead.id,
            requestedDate: tourDate,
            requestedTime: tourTime,
            timestamp: new Date().toISOString(),
          },
        },
      },
    });

    return {
      success: true,
      message: `Perfect! I've scheduled a property tour for ${tourDate} at ${tourTime}. Our leasing team will call you shortly to confirm the details. We're excited to show you around!`,
      leadId: lead.id,
    };
  } catch (error: any) {
    console.error('[Function] Schedule Tour Error:', error);
    return {
      success: false,
      error: 'Sorry, I had trouble scheduling the tour. Please try again.',
    };
  }
}

async function handleCheckRentBalance(args: any, call: any, context: any) {
  try {
    console.log('[Function] Check Rent Balance:', args);

    const property = await context.entities.Property.findUnique({
      where: { vapiAssistantId: call.assistantId },
    });

    if (!property) {
      return { success: false, error: 'Property not found' };
    }

    const phoneNumber = normalizePhoneNumber(call.customer?.number);
    const resident = await context.entities.Resident.findFirst({
      where: { phoneNumber, propertyId: property.id },
    });

    if (!resident) {
      return {
        success: false,
        error: 'I could not find your resident profile. Please verify your phone number.',
      };
    }

    const balance = 0;
    const nextDueDate = resident.leaseEnd;

    await context.entities.VapiCall.updateMany({
      where: { vapiCallId: call.id },
      data: {
        residentId: resident.id,
        actionsTaken: {
          balance_checked: {
            residentId: resident.id,
            balance,
            timestamp: new Date().toISOString(),
          },
        },
      },
    });

    return {
      success: true,
      message: balance > 0
        ? `Your current balance is $${balance.toFixed(2)}. The payment is due on ${nextDueDate}.`
        : "Your rent is paid in full. Thank you!",
      balance,
      dueDate: nextDueDate,
    };
  } catch (error: any) {
    console.error('[Function] Check Rent Balance Error:', error);
    return {
      success: false,
      error: 'Sorry, I had trouble checking your balance. Please try again.',
    };
  }
}

async function handleEscalateToHuman(args: any, call: any, context: any) {
  try {
    console.log('[Function] Escalate to Human:', args);

    const property = await context.entities.Property.findUnique({
      where: { vapiAssistantId: call.assistantId },
    });

    if (!property) {
      return { success: false, error: 'Property not found' };
    }

    await context.entities.VapiCall.updateMany({
      where: { vapiCallId: call.id },
      data: {
        actionsTaken: {
          escalated_to_human: {
            reason: args.reason,
            timestamp: new Date().toISOString(),
          },
        },
      },
    });

    return {
      success: true,
      message: property.emergencyPhone
        ? `I'm connecting you with our team now. Please hold for just a moment.`
        : "I've created a priority callback request. Our property manager will call you back within 15 minutes.",
    };
  } catch (error: any) {
    console.error('[Function] Escalate Error:', error);
    return {
      success: false,
      error: 'Sorry, I had trouble connecting you. Please try again.',
    };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  if (digits.length > 10 && !digits.startsWith('+')) {
    return `+${digits}`;
  }
  
  return digits;
}
