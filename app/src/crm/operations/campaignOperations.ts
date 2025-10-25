// app/src/crm/operations/campaignOperations.ts

import { HttpError } from 'wasp/server';
import {
  registerPlatformBrand,
  createCampaignForOrganization,
  checkCampaignStatus,
  checkAllPendingCampaigns,
  getCampaignLimits,
  suspendCampaign,
  reactivateCampaign,
} from '../twilio/campaignService';
import {
  autoProvisionPhoneNumber,
} from '../twilio/phoneNumberService';

export const registerPlatformBrandOp = async (
  args: any,
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  const user = await context.entities.User.findUnique({
    where: { id: context.user.id },
  });

  if (!user?.isAdmin) {
    throw new HttpError(403, 'Only admins can register platform brand');
  }

  try {
    const brandSid = await registerPlatformBrand(context.entities);
    return {
      success: true,
      brandSid,
      message: 'Platform brand registered successfully',
    };
  } catch (error: any) {
    throw new HttpError(500, error.message);
  }
};

export const setupOrganizationCommunication = async (
  args: {
    organizationId: string;
    areaCode?: string;
  },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  const user = await context.entities.User.findUnique({
    where: { id: context.user.id },
  });

  if (!user?.isAdmin) {
    throw new HttpError(403, 'Only admins can setup organization communication');
  }

  const { organizationId, areaCode = '555' } = args;

  try {
    const org = await context.entities.Organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      throw new HttpError(404, 'Organization not found');
    }

    if (org.communicationSetup && org.campaignStatus === 'APPROVED') {
      throw new HttpError(400, 'Organization already fully setup');
    }

    if (!org.twilioPhoneNumber) {
      console.log(`📞 Provisioning phone number for ${org.name}...`);
      await autoProvisionPhoneNumber(organizationId, areaCode, context.entities);
    }

    if (!org.twilioCampaignSid) {
      console.log(`📋 Creating campaign for ${org.name}...`);
      const campaign = await createCampaignForOrganization(
        organizationId,
        context.entities
      );

      return {
        success: true,
        phoneNumber: org.twilioPhoneNumber,
        campaignSid: campaign.campaignSid,
        status: 'PENDING',
        message: 'Phone number assigned and campaign created. Awaiting carrier approval (1-3 days).',
      };
    }

    const status = await checkCampaignStatus(organizationId, context.entities);

    return {
      success: true,
      phoneNumber: org.twilioPhoneNumber,
      campaignSid: org.twilioCampaignSid,
      status,
      message: `Campaign status: ${status}`,
    };
  } catch (error: any) {
    console.error('Error setting up organization:', error);
    throw new HttpError(500, error.message);
  }
};

export const checkCampaignStatusOp = async (
  args: { organizationId: string },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  try {
    const status = await checkCampaignStatus(args.organizationId, context.entities);
    
    const org = await context.entities.Organization.findUnique({
      where: { id: args.organizationId },
    });

    return {
      organizationId: args.organizationId,
      organizationName: org?.name,
      campaignSid: org?.twilioCampaignSid,
      status,
      smsEnabled: org?.smsEnabled || false,
      approvedAt: org?.campaignApprovedAt,
    };
  } catch (error: any) {
    throw new HttpError(500, error.message);
  }
};

export const checkAllPendingCampaignsOp = async (
  args: any,
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  const user = await context.entities.User.findUnique({
    where: { id: context.user.id },
  });

  if (!user?.isAdmin) {
    throw new HttpError(403, 'Only admins can check all campaigns');
  }

  try {
    const results = await checkAllPendingCampaigns(context.entities);
    
    // Ensure SuperJSON compatibility by converting to plain objects
    return results.map((result: any) => ({
      organizationId: String(result.organizationId),
      organizationName: String(result.organizationName),
      status: String(result.status),
      ...(result.error && { error: String(result.error) })
    }));
  } catch (error: any) {
    throw new HttpError(500, error.message);
  }
};

export const getCampaignLimitsOp = async (
  args: { organizationId: string },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  try {
    const limits = await getCampaignLimits(args.organizationId, context.entities);
    return limits;
  } catch (error: any) {
    throw new HttpError(500, error.message);
  }
};

export const suspendOrganizationCampaign = async (
  args: {
    organizationId: string;
    reason: string;
  },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  const user = await context.entities.User.findUnique({
    where: { id: context.user.id },
  });

  if (!user?.isAdmin) {
    throw new HttpError(403, 'Only admins can suspend campaigns');
  }

  try {
    await suspendCampaign(args.organizationId, args.reason, context.entities);
    return { success: true, message: 'Campaign suspended' };
  } catch (error: any) {
    throw new HttpError(500, error.message);
  }
};

export const reactivateOrganizationCampaign = async (
  args: { organizationId: string },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  const user = await context.entities.User.findUnique({
    where: { id: context.user.id },
  });

  if (!user?.isAdmin) {
    throw new HttpError(403, 'Only admins can reactivate campaigns');
  }

  try {
    await reactivateCampaign(args.organizationId, context.entities);
    return { success: true, message: 'Campaign reactivated' };
  } catch (error: any) {
    throw new HttpError(500, error.message);
  }
};
