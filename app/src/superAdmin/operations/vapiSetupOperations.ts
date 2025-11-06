import { HttpError } from 'wasp/server';
import { vapiClient, buildAssistantSystemPrompt, buildAssistantFunctions } from '../../vapi/vapiClient';

export const setupPropertyVapi = async (args: any, context: any) => {
  if (!context.user?.isSuperAdmin) {
    throw new HttpError(403, 'Super Admin access required');
  }

  const { propertyId, areaCode, voiceProvider } = args;

  // Get property
  const property = await context.entities.Property.findUnique({
    where: { id: propertyId },
    include: { organization: true },
  });

  if (!property) {
    throw new HttpError(404, 'Property not found');
  }

  if (property.vapiSetupCompleted) {
    return {
      success: false,
      error: 'Vapi already setup for this property',
    };
  }

  try {
    // Step 1: Get available phone numbers
    console.log('[Vapi Setup] Getting available numbers...');
    const availableNumbers = await vapiClient.getAvailablePhoneNumbers(areaCode);
    
    if (!availableNumbers || availableNumbers.length === 0) {
      throw new Error('No phone numbers available in that area code');
    }

    // Step 2: Purchase phone number
    console.log('[Vapi Setup] Purchasing number:', availableNumbers[0]);
    const purchasedNumber = await vapiClient.purchasePhoneNumber(availableNumbers[0].phoneNumber);

    // Step 3: Create AI assistant
    console.log('[Vapi Setup] Creating assistant...');
    const systemPrompt = buildAssistantSystemPrompt(property);
    const functions = buildAssistantFunctions();

    const assistant = await vapiClient.createAssistant({
      name: `${property.name} Assistant`,
      model: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
        systemPrompt,
      },
      voice: {
        provider: voiceProvider || '11labs',
        voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel voice
      },
      firstMessage: property.aiGreeting || 'Hello! How can I help you today?',
      serverUrl: process.env.VAPI_WEBHOOK_URL!,
      serverUrlSecret: process.env.VAPI_WEBHOOK_SECRET!,
      functions,
      endCallFunctionEnabled: true,
      recordingEnabled: true,
      transcriptPlan: {
        enabled: true,
        provider: 'deepgram',
      },
    });

    // Step 4: Link phone number to assistant
    console.log('[Vapi Setup] Linking phone to assistant...');
    await vapiClient.updatePhoneNumber(purchasedNumber.id, {
      assistantId: assistant.id,
      name: property.name,
    });

    // Step 5: Update property in database
    console.log('[Vapi Setup] Updating property...');
    await context.entities.Property.update({
      where: { id: propertyId },
      data: {
        vapiPhoneNumber: purchasedNumber.phoneNumber,
        vapiPhoneNumberId: purchasedNumber.id,
        vapiAssistantId: assistant.id,
        vapiEnabled: true,
        vapiSetupCompleted: true,
        vapiActivatedAt: new Date(),
      },
    });

    // Step 6: Update organization
    await context.entities.Organization.update({
      where: { id: property.organizationId },
      data: {
        vapiEnabled: true,
        setupCompleted: true,
      },
    });

    console.log('[Vapi Setup] ✅ Complete!');

    return {
      success: true,
      phoneNumber: purchasedNumber.phoneNumber,
      assistantId: assistant.id,
      message: 'Vapi setup completed successfully',
    };
  } catch (error: any) {
    console.error('[Vapi Setup] Error:', error);
    return {
      success: false,
      error: error.message || 'Setup failed',
    };
  }
};
