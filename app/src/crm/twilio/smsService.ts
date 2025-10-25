// app/src/crm/twilio/smsService.ts

import { getTwilioClient } from './client';
import type { Organization } from 'wasp/entities';

interface SendSMSParams {
  to: string;
  message: string;
  organization: Organization;
  mediaUrls?: string[]; // For MMS
}

export async function sendSMS(params: SendSMSParams): Promise<any> {
  const { to, message, organization, mediaUrls } = params;
  
  // Verify organization has phone number
  if (!organization.twilioPhoneNumber) {
    throw new Error(`Organization ${organization.name} does not have a phone number assigned`);
  }
  
  // Verify SMS is enabled
  if (!organization.smsEnabled) {
    throw new Error(`SMS is disabled for organization ${organization.name}`);
  }
  
  const client = getTwilioClient();
  
  try {
    const messageData: any = {
      body: message,
      from: organization.twilioPhoneNumber,
      to: to,
      statusCallback: `${process.env.WASP_WEB_CLIENT_URL}/api/twilio/status`,
    };
    
    // Add media if provided (MMS)
    if (mediaUrls && mediaUrls.length > 0) {
      messageData.mediaUrl = mediaUrls;
    }
    
    const sentMessage = await client.messages.create(messageData);
    
    console.log(`✅ SMS sent from ${organization.name}: ${sentMessage.sid}`);
    
    return {
      sid: sentMessage.sid,
      status: sentMessage.status,
      to: sentMessage.to,
      from: sentMessage.from,
    };
  } catch (error: any) {
    console.error(`❌ Failed to send SMS for ${organization.name}:`, error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
}

// Send bulk SMS (to multiple recipients)
export async function sendBulkSMS(params: {
  recipients: string[];
  message: string;
  organization: Organization;
}): Promise<any[]> {
  const { recipients, message, organization } = params;
  
  const results = await Promise.allSettled(
    recipients.map(to => 
      sendSMS({ to, message, organization })
    )
  );
  
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  console.log(`Bulk SMS for ${organization.name}: ${successful} sent, ${failed} failed`);
  
  return results;
}

// Format phone number to E.164
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Add +1 for US numbers if not present
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  return `+${digits}`;
}
