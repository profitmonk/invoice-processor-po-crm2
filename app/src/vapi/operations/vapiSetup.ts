// app/src/vapi/operations/vapiSetup.ts
import { HttpError } from 'wasp/server';
import { vapiClient } from '../vapiClient';
import { buildAssistantSystemPrompt, buildAssistantFunctions } from '../vapiClient';
import type { Property } from 'wasp/entities';

// ============================================
// SETUP PROPERTY WITH VAPI (End-to-End)
// ============================================

type SetupPropertyVapiInput = {
  propertyId: string;
  areaCode?: string;
  voiceProvider?: '11labs' | 'playht' | 'deepgram';
  voiceId?: string;
};

export const setupPropertyVapi = async (
  args: SetupPropertyVapiInput,
  context: any
): Promise<{ success: boolean; phoneNumber?: string; assistantId?: string; error?: string }> => {
  if (!context.user?.isSuperAdmin) {
    throw new HttpError(403, 'Super admin access required');
  }

  const { propertyId, areaCode, voiceProvider = '11labs', voiceId } = args;

  try {
    // 1. Get property
    const property = await context.entities.Property.findUnique({
      where: { id: propertyId },
      include: { organization: true },
    });

    if (!property) {
      throw new HttpError(404, 'Property not found');
    }

    // 2. Purchase phone number
    console.log('[Vapi Setup] Step 1: Purchasing phone number...');
    const availableNumbers = await vapiClient.getAvailablePhoneNumbers(areaCode);
    
    if (availableNumbers.length === 0) {
      throw new Error(`No phone numbers available in area code ${areaCode || 'any'}`);
    }

    const selectedNumber = availableNumbers[0].phoneNumber;
    const phoneNumberResponse = await vapiClient.purchasePhoneNumber(selectedNumber);

    console.log('[Vapi Setup] Phone number purchased:', phoneNumberResponse.phoneNumber);

    // 3. Create AI assistant
    console.log('[Vapi Setup] Step 2: Creating AI assistant...');
    
    const systemPrompt = buildAssistantSystemPrompt(property);
    const functions = buildAssistantFunctions();

    const assistantResponse = await vapiClient.createAssistant({
      name: `${property.name} - AI Receptionist`,
      model: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
        systemPrompt,
      },
      voice: {
        provider: voiceProvider,
        voiceId: voiceId || (voiceProvider === '11labs' ? '21m00Tcm4TlvDq8ikWAM' : 'default-voice'),
      },
      functions,
      firstMessage: property.aiGreeting || `Hello! Thank you for calling ${property.name}. How can I help you today?`,
      serverUrl: `${process.env.WASP_WEB_CLIENT_URL}/api/vapi/webhook`,
      serverUrlSecret: process.env.VAPI_WEBHOOK_SECRET!,
      recordingEnabled: true,
      transcriptPlan: { enabled: true, provider: 'deepgram' as const },
    });

    console.log('[Vapi Setup] Assistant created:', assistantResponse.id);

    // 4. Link phone number to assistant
    console.log('[Vapi Setup] Step 3: Linking phone to assistant...');
    await vapiClient.updatePhoneNumber(phoneNumberResponse.id, {
      assistantId: assistantResponse.id,
    });

    // 5. Update property with Vapi info
    await context.entities.Property.update({
      where: { id: propertyId },
      data: {
        vapiPhoneNumber: phoneNumberResponse.phoneNumber,
        vapiPhoneNumberId: phoneNumberResponse.id,
        vapiAssistantId: assistantResponse.id,
        vapiEnabled: true,
        vapiSetupCompleted: true,
        vapiActivatedAt: new Date(),
      },
    });

    console.log('[Vapi Setup] ✅ Setup complete!');

    return {
      success: true,
      phoneNumber: phoneNumberResponse.phoneNumber,
      assistantId: assistantResponse.id,
    };
  } catch (error: any) {
    console.error('[Vapi Setup] Error:', error);
    return {
      success: false,
      error: error.message || 'Setup failed',
    };
  }
};

// ============================================
// PURCHASE PHONE NUMBER ONLY
// ============================================

export const purchaseVapiPhoneNumber = async (
  args: { propertyId: string; areaCode?: string },
  context: any
) => {
  if (!context.user?.isSuperAdmin) {
    throw new HttpError(403, 'Super admin access required');
  }

  const availableNumbers = await vapiClient.getAvailablePhoneNumbers(args.areaCode);
  
  if (availableNumbers.length === 0) {
    throw new Error('No phone numbers available');
  }

  const selectedNumber = availableNumbers[0].phoneNumber;
  const phoneNumberResponse = await vapiClient.purchasePhoneNumber(selectedNumber);

  await context.entities.Property.update({
    where: { id: args.propertyId },
    data: {
      vapiPhoneNumber: phoneNumberResponse.phoneNumber,
      vapiPhoneNumberId: phoneNumberResponse.id,
    },
  });

  return phoneNumberResponse;
};

// ============================================
// CREATE ASSISTANT ONLY
// ============================================

export const createVapiAssistant = async (
  args: { propertyId: string; voiceProvider?: '11labs' | 'playht' | 'deepgram'; voiceId?: string },
  context: any
) => {
  if (!context.user?.isSuperAdmin) {
    throw new HttpError(403, 'Super admin access required');
  }

  const property = await context.entities.Property.findUnique({
    where: { id: args.propertyId },
    include: { organization: true },
  });

  if (!property) {
    throw new HttpError(404, 'Property not found');
  }

  const systemPrompt = buildAssistantSystemPrompt(property);
  const functions = buildAssistantFunctions();

  const assistantResponse = await vapiClient.createAssistant({
    name: `${property.name} - AI Receptionist`,
    model: {
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.7,
      systemPrompt,
    },
    voice: {
      provider: args.voiceProvider || '11labs',
      voiceId: args.voiceId || '21m00Tcm4TlvDq8ikWAM',
    },
    functions,
    firstMessage: property.aiGreeting || `Hello! Thank you for calling ${property.name}. How can I help you today?`,
    serverUrl: `${process.env.WASP_WEB_CLIENT_URL}/api/vapi/webhook`,
    serverUrlSecret: process.env.VAPI_WEBHOOK_SECRET!,
    recordingEnabled: true,
    transcriptPlan: { enabled: true, provider: 'deepgram' as const },
  });

  await context.entities.Property.update({
    where: { id: args.propertyId },
    data: {
      vapiAssistantId: assistantResponse.id,
      vapiSetupCompleted: !!(property.vapiPhoneNumber && assistantResponse.id),
    },
  });

  return assistantResponse;
};

// ============================================
// GET CALL LOGS
// ============================================

type GetCallLogsInput = {
  propertyId?: string;
  organizationId?: string;
  limit?: number;
  status?: string;
};

export const getVapiCallLogs = async (
  args: GetCallLogsInput,
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Authentication required');
  }

  const where: any = {};

  if (args.propertyId) {
    where.propertyId = args.propertyId;
  } else if (context.user.organizationId && !context.user.isSuperAdmin) {
    where.organizationId = context.user.organizationId;
  } else if (args.organizationId && context.user.isSuperAdmin) {
    where.organizationId = args.organizationId;
  }

  if (args.status) {
    where.callStatus = args.status;
  }

  const calls = await context.entities.VapiCall.findMany({
    where,
    include: {
      property: {
        select: {
          id: true,
          name: true,
        },
      },
      resident: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          unitNumber: true,
        },
      },
      lead: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      maintenanceRequest: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: args.limit || 50,
  });

  return calls;
};
