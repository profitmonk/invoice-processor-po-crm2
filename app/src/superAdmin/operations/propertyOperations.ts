// app/src/superAdmin/operations/propertyOperations.ts
import type { Property } from 'wasp/entities';
import { HttpError } from 'wasp/server';

// ============================================
// CREATE PROPERTY (WITH OPTIONAL VAPI SETUP)
// ============================================

type CreatePropertyInput = {
  organizationId: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  
  // Vapi Configuration (optional at creation)
  setupVapi?: boolean;
  vapiPhoneNumber?: string;
  vapiPhoneNumberId?: string;
  vapiAssistantId?: string;
  
  // AI Configuration
  aiPersonality?: string;
  aiGreeting?: string;
  aiInstructions?: string;
  
  // Business Hours
  businessHoursStart?: string;
  businessHoursEnd?: string;
  timezone?: string;
  emergencyPhone?: string;
};

type CreatePropertyOutput = {
  property: Property;
  vapiSetupNeeded: boolean;
};

export const createPropertySuperAdmin = async (
  args: CreatePropertyInput,
  context: any
): Promise<CreatePropertyOutput> => {
  if (!context.user?.isSuperAdmin) {
    throw new HttpError(403, 'Super admin access required');
  }

  const {
    organizationId,
    name,
    code,
    address,
    city,
    state,
    zipCode,
    setupVapi = false,
    vapiPhoneNumber,
    vapiPhoneNumberId,
    vapiAssistantId,
    aiPersonality,
    aiGreeting,
    aiInstructions,
    businessHoursStart,
    businessHoursEnd,
    timezone,
    emergencyPhone,
  } = args;

  // Verify organization exists
  const organization = await context.entities.Organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    throw new HttpError(404, 'Organization not found');
  }

  // Check if property code already exists in this org
  const existing = await context.entities.Property.findFirst({
    where: {
      organizationId,
      code,
    },
  });

  if (existing) {
    throw new HttpError(400, 'Property code already exists in this organization');
  }

  // If Vapi phone number provided, verify it's not already in use
  if (vapiPhoneNumber) {
    const existingPhone = await context.entities.Property.findUnique({
      where: { vapiPhoneNumber },
    });

    if (existingPhone) {
      throw new HttpError(400, 'This phone number is already assigned to another property');
    }
  }

  // Create property
  const property = await context.entities.Property.create({
    data: {
      organizationId,
      name,
      code,
      address,
      city,
      state,
      zipCode,
      isActive: true,
      
      // Vapi fields
      vapiPhoneNumber: setupVapi ? vapiPhoneNumber : null,
      vapiPhoneNumberId: setupVapi ? vapiPhoneNumberId : null,
      vapiAssistantId: setupVapi ? vapiAssistantId : null,
      vapiEnabled: setupVapi && !!vapiPhoneNumber && !!vapiAssistantId,
      vapiSetupCompleted: setupVapi && !!vapiPhoneNumber && !!vapiAssistantId,
      
      // AI Configuration
      aiPersonality: aiPersonality || 'professional and helpful',
      aiGreeting: aiGreeting || `Thank you for calling ${name}. How can I help you today?`,
      aiInstructions,
      
      // Business Hours
      businessHoursStart: businessHoursStart || '09:00',
      businessHoursEnd: businessHoursEnd || '17:00',
      timezone: timezone || organization.timezone || 'America/Los_Angeles',
      emergencyPhone,
      
      // Cost Estimation (base phone number cost)
      estimatedMonthlyCost: setupVapi ? 15.0 : 0,
      
      // Timestamps
      vapiActivatedAt: setupVapi && vapiPhoneNumber ? new Date() : null,
    },
  });

  // Update organization's Vapi enabled status if this is their first Vapi property
  if (setupVapi && vapiPhoneNumber) {
    const vapiProperties = await context.entities.Property.count({
      where: {
        organizationId,
        vapiEnabled: true,
      },
    });

    if (vapiProperties === 1) {
      // This is the first Vapi property
      await context.entities.Organization.update({
        where: { id: organizationId },
        data: {
          vapiEnabled: true,
        },
      });
    }
  }

  return {
    property,
    vapiSetupNeeded: setupVapi && (!vapiPhoneNumber || !vapiAssistantId),
  };
};

// ============================================
// UPDATE PROPERTY
// ============================================

type UpdatePropertyInput = {
  propertyId: string;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isActive?: boolean;
  
  // Vapi Configuration
  vapiPhoneNumber?: string;
  vapiPhoneNumberId?: string;
  vapiAssistantId?: string;
  vapiEnabled?: boolean;
  vapiSetupCompleted?: boolean;
  vapiActivatedAt?: Date;
  
  // AI Configuration
  aiPersonality?: string;
  aiGreeting?: string;
  aiInstructions?: string;
  aiKnowledgeBase?: any;
  
  // Business Hours
  businessHoursStart?: string;
  businessHoursEnd?: string;
  timezone?: string;
  afterHoursMessage?: string;
  emergencyPhone?: string;
  
  // Cost
  estimatedMonthlyCost?: number;
};

export const updatePropertySuperAdmin = async (
  args: UpdatePropertyInput,
  context: any
): Promise<Property> => {
  if (!context.user?.isSuperAdmin) {
    throw new HttpError(403, 'Super admin access required');
  }

  const { propertyId, ...updateData } = args;

  // Verify property exists
  const property = await context.entities.Property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new HttpError(404, 'Property not found');
  }

  // If updating phone number, verify it's not in use
  if (updateData.vapiPhoneNumber && updateData.vapiPhoneNumber !== property.vapiPhoneNumber) {
    const existingPhone = await context.entities.Property.findUnique({
      where: { vapiPhoneNumber: updateData.vapiPhoneNumber },
    });

    if (existingPhone) {
      throw new HttpError(400, 'This phone number is already assigned to another property');
    }
  }

  // Update property
  const updatedProperty = await context.entities.Property.update({
    where: { id: propertyId },
    data: {
      ...updateData,
      updatedAt: new Date(),
      
      // Update vapiSetupCompleted if all required fields are present
      ...(updateData.vapiPhoneNumber && updateData.vapiAssistantId
        ? { vapiSetupCompleted: true }
        : {}),
        
      // Update vapiActivatedAt if enabling Vapi
      ...(updateData.vapiEnabled && !property.vapiEnabled
        ? { vapiActivatedAt: new Date() }
        : {}),
        
      // Update vapiDeactivatedAt if disabling Vapi
      ...(!updateData.vapiEnabled && property.vapiEnabled
        ? { vapiDeactivatedAt: new Date() }
        : {}),
    },
  });

  return updatedProperty;
};

// ============================================
// DELETE PROPERTY
// ============================================

type DeletePropertyInput = {
  propertyId: string;
};

export const deletePropertySuperAdmin = async (
  args: DeletePropertyInput,
  context: any
): Promise<{ success: boolean }> => {
  if (!context.user?.isSuperAdmin) {
    throw new HttpError(403, 'Super admin access required');
  }

  const { propertyId } = args;

  // Verify property exists
  const property = await context.entities.Property.findUnique({
    where: { id: propertyId },
    include: {
      residents: true,
      leads: true,
      maintenanceRequests: true,
    },
  });

  if (!property) {
    throw new HttpError(404, 'Property not found');
  }

  // Check if property has active residents
  if (property.residents.length > 0) {
    throw new HttpError(
      400,
      'Cannot delete property with residents. Archive or transfer residents first.'
    );
  }

  // Check if property has active leads
  if (property.leads.length > 0) {
    throw new HttpError(400, 'Cannot delete property with leads. Archive or transfer leads first.');
  }

  // Check if property has open maintenance requests
  const openRequests = property.maintenanceRequests.filter(
    (req: any) => req.status !== 'COMPLETED' && req.status !== 'CLOSED' && req.status !== 'CANCELLED'
  );

  if (openRequests.length > 0) {
    throw new HttpError(
      400,
      'Cannot delete property with open maintenance requests. Close or cancel requests first.'
    );
  }

  // Soft delete by setting isActive to false
  await context.entities.Property.update({
    where: { id: propertyId },
    data: {
      isActive: false,
      vapiEnabled: false,
      vapiDeactivatedAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return { success: true };
};

// ============================================
// GET PROPERTY DETAILS
// ============================================

type GetPropertyDetailsInput = {
  propertyId: string;
};

export const getPropertyDetailsSuperAdmin = async (
  args: GetPropertyDetailsInput,
  context: any
): Promise<any> => {
  if (!context.user?.isSuperAdmin) {
    throw new HttpError(403, 'Super admin access required');
  }

  const property = await context.entities.Property.findUnique({
    where: { id: args.propertyId },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      residents: {
        where: { status: 'ACTIVE' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          unitNumber: true,
          monthlyRentAmount: true,
        },
      },
      leads: {
        where: {
          status: {
            in: ['NEW', 'CONTACTED', 'TOURING_SCHEDULED', 'TOURED', 'APPLIED'],
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          status: true,
          priority: true,
        },
      },
      maintenanceRequests: {
        where: {
          status: {
            in: ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS'],
          },
        },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          createdAt: true,
        },
      },
      vapiCalls: {
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          vapiCallId: true,
          callType: true,
          callStatus: true,
          durationSeconds: true,
          cost: true,
          createdAt: true,
          callerPhone: true,
          summary: true,
        },
      },
    },
  });

  if (!property) {
    throw new HttpError(404, 'Property not found');
  }

  return property;
};

// ============================================
// GET PROPERTIES BY ORGANIZATION
// ============================================

type GetPropertiesByOrgInput = {
  organizationId: string;
};

export const getPropertiesByOrganizationSuperAdmin = async (
  args: GetPropertiesByOrgInput,
  context: any
): Promise<Property[]> => {
  if (!context.user?.isSuperAdmin) {
    throw new HttpError(403, 'Super admin access required');
  }

  const properties = await context.entities.Property.findMany({
    where: {
      organizationId: args.organizationId,
    },
    include: {
      residents: {
        where: { status: 'ACTIVE' },
        select: { id: true },
      },
      leads: {
        select: { id: true },
      },
      maintenanceRequests: {
        where: {
          status: {
            in: ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS'],
          },
        },
        select: { id: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return properties.map((p: any) => ({
    ...p,
    residentCount: p.residents.length,
    leadCount: p.leads.length,
    openMaintenanceCount: p.maintenanceRequests.length,
  }));
};

// ============================================
// ACTIVATE/DEACTIVATE PROPERTY VAPI
// ============================================

type TogglePropertyVapiInput = {
  propertyId: string;
  enabled: boolean;
};

export const togglePropertyVapiSuperAdmin = async (
  args: TogglePropertyVapiInput,
  context: any
): Promise<Property> => {
  if (!context.user?.isSuperAdmin) {
    throw new HttpError(403, 'Super admin access required');
  }

  const { propertyId, enabled } = args;

  const property = await context.entities.Property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new HttpError(404, 'Property not found');
  }

  // Check if property has required Vapi configuration
  if (enabled && (!property.vapiPhoneNumber || !property.vapiAssistantId)) {
    throw new HttpError(400, 'Property must have phone number and assistant configured before enabling');
  }

  const updatedProperty = await context.entities.Property.update({
    where: { id: propertyId },
    data: {
      vapiEnabled: enabled,
      vapiActivatedAt: enabled ? new Date() : property.vapiActivatedAt,
      vapiDeactivatedAt: !enabled ? new Date() : null,
      updatedAt: new Date(),
    },
  });

  return updatedProperty;
};
