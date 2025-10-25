// app/src/crm/twilio/campaignService.ts

import { getTwilioClient } from './client';
import type { PrismaClient } from '@prisma/client';

// Define result types for better type safety
interface CampaignCheckResult {
  organizationId: string;
  organizationName: string;
  status: string;
  error?: string;
}

// ============================================
// STEP 1: REGISTER PLATFORM BRAND (ONE-TIME)
// ============================================
export async function registerPlatformBrand(prisma: PrismaClient): Promise<string> {
  const client = getTwilioClient();
  
  try {
    // Check if platform config exists
    let platformConfig = await prisma.platformConfig.findFirst();
    
    if (platformConfig?.twilioBrandSid && platformConfig.twilioBrandStatus === 'APPROVED') {
      console.log('✅ Platform brand already registered and approved:', platformConfig.twilioBrandSid);
      return platformConfig.twilioBrandSid;
    }
    
    // Check existing brands in Twilio
    const existingBrands = await client.messaging.v1.brandRegistrations.list();
    
    if (existingBrands.length > 0) {
      const brandSid = existingBrands[0].sid;
      console.log('✅ Found existing brand in Twilio:', brandSid);
      
      // Update platform config
      if (!platformConfig) {
        platformConfig = await prisma.platformConfig.create({
          data: {
            twilioBrandSid: brandSid,
            twilioBrandStatus: 'APPROVED',
            twilioBrandRegisteredAt: new Date(),
            twilioBrandApprovedAt: new Date(),
          },
        });
      } else {
        await prisma.platformConfig.update({
          where: { id: platformConfig.id },
          data: {
            twilioBrandSid: brandSid,
            twilioBrandStatus: 'APPROVED',
          },
        });
      }
      
      return brandSid;
    }
    
    // If no brand exists, need to create one
    console.log('⚠️  No brand found. You need to:');
    console.log('1. Complete Twilio Trust Hub verification');
    console.log('2. Register your brand in Twilio Console');
    console.log('3. Get Customer Profile Bundle SID');
    console.log('4. Get A2P Profile Bundle SID');
    console.log('5. Then run this function again');
    
    throw new Error('Brand registration requires manual Trust Hub setup first');
  } catch (error: any) {
    console.error('❌ Brand registration check failed:', error);
    throw error;
  }
}

// ============================================
// GET PLATFORM BRAND (Helper)
// ============================================
async function getPlatformBrandSid(prisma: PrismaClient): Promise<string> {
  const platformConfig = await prisma.platformConfig.findFirst();
  
  if (!platformConfig?.twilioBrandSid) {
    throw new Error('Platform brand not registered. Run registerPlatformBrand() first.');
  }
  
  if (platformConfig.twilioBrandStatus !== 'APPROVED') {
    throw new Error(`Platform brand not approved. Status: ${platformConfig.twilioBrandStatus}`);
  }
  
  return platformConfig.twilioBrandSid;
}

// ============================================
// STEP 2: CREATE CAMPAIGN FOR ORGANIZATION
// ============================================
export async function createCampaignForOrganization(
  organizationId: string,
  prisma: PrismaClient
): Promise<any> {
  const client = getTwilioClient();
  
  // Get organization
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { assignedPhoneNumber: true },
  });
  
  if (!organization) {
    throw new Error('Organization not found');
  }
  
  if (organization.twilioCampaignSid) {
    throw new Error(`Organization already has a campaign: ${organization.twilioCampaignSid}`);
  }
  
  if (!organization.twilioPhoneNumber) {
    throw new Error('Organization must have a phone number assigned first');
  }
  
  // Get platform brand SID
  const brandSid = await getPlatformBrandSid(prisma);
  
  try {
    console.log(`🚀 Creating campaign for ${organization.name}...`);
    
    // STEP 1: Create Messaging Service
    const messagingService = await client.messaging.v1.services.create({
      friendlyName: `${organization.name} - Tenant Communications`,
      inboundRequestUrl: `${process.env.WASP_WEB_CLIENT_URL}/api/twilio/sms`,
      inboundMethod: 'POST',
      statusCallback: `${process.env.WASP_WEB_CLIENT_URL}/api/twilio/status`,
      usecase: 'notifications',
      validityPeriod: 14400, // 4 hours
    });
    
    console.log(`✅ Messaging service created: ${messagingService.sid}`);
    
    // STEP 2: Add phone number to messaging service
    if (organization.twilioPhoneNumberSid) {
      await client.messaging.v1.services(messagingService.sid)
        .phoneNumbers
        .create({
          phoneNumberSid: organization.twilioPhoneNumberSid,
        });
      
      console.log(`✅ Phone number ${organization.twilioPhoneNumber} linked to messaging service`);
    }
    
    // STEP 3: Register A2P Campaign
    const campaign = await client.messaging.v1.services(messagingService.sid)
      .usAppToPerson
      .create({
        description: `Tenant and prospect communication for ${organization.name}. Automated notifications for maintenance requests, lease renewals, rent reminders, and property inquiries. Two-way SMS communication between residents and property management.`,
        
        messageFlow: `Residents/prospects text ${organization.twilioPhoneNumber} to:
1. Report maintenance issues (AI creates tickets)
2. Ask property questions (AI responds)
3. Schedule tours (AI coordinates)
4. Receive rent reminders and lease notifications
Property managers can send announcements and updates.`,
        
        brandRegistrationSid: brandSid,
        usAppToPersonUsecase: 'CUSTOMER_CARE',
        
        hasEmbeddedLinks: true, // For application links, tour booking
        hasEmbeddedPhone: true, // Emergency contact numbers
        
        subscriberOptIn: true,
        ageGated: false,
        directLending: false,
        
        messageVolume: '1000-10000', // Expected daily volume per org
        
        // Opt-in/out handling
        optInMessage: `Welcome to ${organization.name} text notifications! Reply YES to confirm. Msg&data rates may apply. Reply STOP to opt out.`,
        optOutMessage: `You've been unsubscribed from ${organization.name} texts. Reply START to rejoin.`,
        helpMessage: `${organization.name} - Text HELP for support, STOP to opt out. Contact: ${organization.emergencyPhone || 'office'}`,
        
        optInKeywords: ['START', 'YES', 'UNSTOP', 'SUBSCRIBE'],
        optOutKeywords: ['STOP', 'END', 'CANCEL', 'UNSUBSCRIBE', 'QUIT'],
        helpKeywords: ['HELP', 'INFO', 'SUPPORT', 'ASSISTANCE'],
      });
    
    console.log(`✅ A2P Campaign created: ${campaign.sid}`);
    console.log(`   Status: ${campaign.campaignStatus}`);
    
    // STEP 4: Update organization in database
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        twilioBrandSid: brandSid,
        twilioCampaignSid: campaign.sid,
        twilioMessagingServiceSid: messagingService.sid,
        campaignStatus: 'PENDING',
        campaignUseCase: 'CUSTOMER_CARE',
        campaignDescription: campaign.description,
        campaignRegisteredAt: new Date(),
        dailySMSLimit: 2000, // Default, will be updated by carrier
        smsEnabled: false, // Disabled until approved
      },
    });
    
    // Update phone number record
    if (organization.assignedPhoneNumber) {
      await prisma.twilioPhoneNumber.update({
        where: { id: organization.assignedPhoneNumber.id },
        data: {
          messagingServiceSid: messagingService.sid,
          campaignSid: campaign.sid,
        },
      });
    }
    
    console.log(`✅ Campaign registration complete for ${organization.name}`);
    console.log(`⏳ Campaign pending carrier approval (1-3 business days)`);
    
    return {
      campaignSid: campaign.sid,
      messagingServiceSid: messagingService.sid,
      status: 'PENDING',
      message: 'Campaign created and pending carrier approval',
    };
  } catch (error: any) {
    console.error(`❌ Campaign creation failed for ${organization.name}:`, error);
    
    // Update org with failure
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        campaignStatus: 'FAILED',
        campaignRejectionReason: error.message,
      },
    });
    
    throw new Error(`Campaign creation failed: ${error.message}`);
  }
}

// ============================================
// CHECK CAMPAIGN STATUS (Manual Check)
// ============================================
export async function checkCampaignStatus(
  organizationId: string,
  prisma: PrismaClient
): Promise<string> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });
  
  if (!organization?.twilioCampaignSid || !organization.twilioMessagingServiceSid) {
    return 'NOT_REGISTERED';
  }
  
  const client = getTwilioClient();
  
  try {
    // Fetch campaign from Twilio
    const campaigns = await client.messaging.v1
      .services(organization.twilioMessagingServiceSid)
      .usAppToPerson
      .list();
    
    const campaign = campaigns.find((c: any) => c.sid === organization.twilioCampaignSid);
    
    if (!campaign) {
      console.log(`⚠️  Campaign not found in Twilio for ${organization.name}`);
      return 'NOT_FOUND';
    }
    
    const status = campaign.campaignStatus;
    console.log(`Campaign status for ${organization.name}: ${status}`);
    
    // Update database
    const updateData: any = {
      campaignStatus: status,
    };
    
    // If approved, enable SMS and set approval date
    if (status === 'APPROVED' && !organization.campaignApprovedAt) {
      updateData.campaignApprovedAt = new Date();
      updateData.smsEnabled = true;
      updateData.communicationSetup = true;
      updateData.setupCompletedAt = new Date();
      console.log(`✅ Campaign APPROVED for ${organization.name} - SMS enabled!`);
    }
    
    // If rejected, log reason
    if (status === 'REJECTED') {
      updateData.campaignRejectedAt = new Date();
      updateData.smsEnabled = false;
      console.log(`❌ Campaign REJECTED for ${organization.name}`);
    }
    
    await prisma.organization.update({
      where: { id: organizationId },
      data: updateData,
    });
    
    return status;
  } catch (error: any) {
    console.error(`Error checking campaign status for ${organization.name}:`, error);
    return 'ERROR';
  }
}

// ============================================
// CHECK ALL PENDING CAMPAIGNS (Batch)
// ============================================
export async function checkAllPendingCampaigns(prisma: PrismaClient): Promise<CampaignCheckResult[]> {
  const pendingOrgs = await prisma.organization.findMany({
    where: {
      campaignStatus: 'PENDING',
    },
  });
  
  console.log(`🔍 Checking ${pendingOrgs.length} pending campaigns...`);
  
  const results: CampaignCheckResult[] = [];
  
  for (const org of pendingOrgs) {
    try {
      const status = await checkCampaignStatus(org.id, prisma);
      results.push({
        organizationId: org.id,
        organizationName: org.name,
        status,
      });
    } catch (error: any) {
      results.push({
        organizationId: org.id,
        organizationName: org.name,
        status: 'ERROR',
        error: error.message,
      });
    }
  }
  
  return results;
}

// ============================================
// GET CAMPAIGN LIMITS AND USAGE
// ============================================
export async function getCampaignLimits(
  organizationId: string,
  prisma: PrismaClient
): Promise<any> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });
  
  if (!organization) {
    throw new Error('Organization not found');
  }
  
  if (!organization.twilioCampaignSid) {
    throw new Error('No campaign registered');
  }
  
  const today = new Date().toDateString();
  const lastReset = organization.lastSMSResetDate?.toDateString();
  
  // Reset if new day
  let dailyUsed = organization.dailySMSUsed || 0;
  if (today !== lastReset) {
    dailyUsed = 0;
  }
  
  const dailyLimit = organization.dailySMSLimit || 2000;
  const remaining = Math.max(0, dailyLimit - dailyUsed);
  const percentUsed = dailyLimit > 0 ? (dailyUsed / dailyLimit) * 100 : 0;
  
  return {
    dailyLimit,
    dailyUsed,
    remaining,
    percentUsed: Math.round(percentUsed),
    resetTime: today !== lastReset ? new Date() : organization.lastSMSResetDate,
    status: organization.campaignStatus,
    smsEnabled: organization.smsEnabled,
  };
}

// ============================================
// TRACK SMS USAGE (Rate Limiting)
// ============================================
export async function trackSMSUsage(
  organizationId: string,
  count: number = 1,
  prisma: PrismaClient
): Promise<void> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });
  
  if (!organization) return;
  
  const today = new Date().toDateString();
  const lastReset = organization.lastSMSResetDate?.toDateString();
  
  if (today !== lastReset) {
    // New day - reset counter
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        dailySMSUsed: count,
        lastSMSResetDate: new Date(),
      },
    });
  } else {
    // Same day - increment
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        dailySMSUsed: { increment: count },
        smsCreditsUsed: { increment: count }, // Total lifetime usage
      },
    });
  }
}

// ============================================
// SUSPEND CAMPAIGN (Manual Action)
// ============================================
export async function suspendCampaign(
  organizationId: string,
  reason: string,
  prisma: PrismaClient
): Promise<void> {
  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      campaignStatus: 'SUSPENDED',
      smsEnabled: false,
      campaignRejectionReason: `Suspended: ${reason}`,
    },
  });
  
  console.log(`⛔ Campaign suspended for organization ${organizationId}: ${reason}`);
}

// ============================================
// REACTIVATE CAMPAIGN
// ============================================
export async function reactivateCampaign(
  organizationId: string,
  prisma: PrismaClient
): Promise<void> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });
  
  if (!organization?.twilioCampaignSid) {
    throw new Error('No campaign to reactivate');
  }
  
  // Check current status with Twilio
  const status = await checkCampaignStatus(organizationId, prisma);
  
  if (status === 'APPROVED') {
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        campaignStatus: 'APPROVED',
        smsEnabled: true,
        campaignRejectionReason: null,
      },
    });
    console.log(`✅ Campaign reactivated for organization ${organizationId}`);
  } else {
    throw new Error(`Cannot reactivate. Campaign status: ${status}`);
  }
}
