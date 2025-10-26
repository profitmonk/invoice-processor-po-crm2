// src/crm/operations/maintenanceOperations.ts

import { HttpError } from 'wasp/server';

// ============================================
// GET ALL MAINTENANCE REQUESTS
// ============================================
export const getMaintenanceRequests = async (
  args: {
    status?: string;
    priority?: string;
    propertyId?: string;
    residentId?: string;
    assignedManagerId?: string;
    requestType?: string;
    searchTerm?: string;
  },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  const user = await context.entities.User.findUnique({
    where: { id: context.user.id },
    include: { organization: true },
  });

  if (!user || !user.organizationId) {
    throw new HttpError(403, 'User must belong to an organization');
  }

  const whereClause: any = {
    organizationId: user.organizationId,
  };

  // Property managers only see requests they're assigned to
  if (user.role === 'PROPERTY_MANAGER' && !user.isAdmin) {
    whereClause.OR = [
      { assignedManagerId: user.id },
      { assignedManagerId: null }, // Unassigned requests
    ];
  }

  if (args.status) {
    whereClause.status = args.status;
  }

  if (args.priority) {
    whereClause.priority = args.priority;
  }

  if (args.propertyId) {
    whereClause.propertyId = args.propertyId;
  }

  if (args.residentId) {
    whereClause.residentId = args.residentId;
  }

  if (args.assignedManagerId) {
    whereClause.assignedManagerId = args.assignedManagerId;
  }

  if (args.requestType) {
    whereClause.requestType = args.requestType;
  }

  if (args.searchTerm) {
    whereClause.OR = [
      { title: { contains: args.searchTerm, mode: 'insensitive' } },
      { description: { contains: args.searchTerm, mode: 'insensitive' } },
      { unitNumber: { contains: args.searchTerm } },
    ];
  }

  const requests = await context.entities.MaintenanceRequest.findMany({
    where: whereClause,
    include: {
      resident: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          email: true,
        },
      },
      property: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      assignedManager: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
    orderBy: [
      { priority: 'desc' }, // EMERGENCY first
      { createdAt: 'desc' },
    ],
  });

  return requests;
};

// ============================================
// GET MAINTENANCE REQUEST BY ID
// ============================================
export const getMaintenanceRequestById = async (
  args: { id: string },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  const user = await context.entities.User.findUnique({
    where: { id: context.user.id },
    include: { organization: true },
  });

  if (!user || !user.organizationId) {
    throw new HttpError(403, 'User must belong to an organization');
  }

  const request = await context.entities.MaintenanceRequest.findUnique({
    where: { id: args.id },
    include: {
      resident: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          email: true,
          unitNumber: true,
        },
      },
      property: {
        select: {
          id: true,
          name: true,
          code: true,
          address: true,
        },
      },
      assignedManager: {
        select: {
          id: true,
          username: true,
          email: true,
          phoneNumber: true,
        },
      },
    },
  });

  if (!request) {
    throw new HttpError(404, 'Maintenance request not found');
  }

  if (request.organizationId !== user.organizationId) {
    throw new HttpError(403, 'Access denied');
  }

  return request;
};

// ============================================
// CREATE MAINTENANCE REQUEST
// ============================================
export const createMaintenanceRequest = async (
  args: {
    residentId: string;
    propertyId: string;
    unitNumber: string;
    requestType: string;
    title: string;
    description: string;
    priority?: string;
    assignedManagerId?: string;
    assignedToPhone?: string;
    assignedToName?: string;
  },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  const user = await context.entities.User.findUnique({
    where: { id: context.user.id },
    include: { organization: true },
  });

  if (!user || !user.organizationId) {
    throw new HttpError(403, 'User must belong to an organization');
  }

  // Verify resident belongs to organization
  const resident = await context.entities.Resident.findUnique({
    where: { id: args.residentId },
  });

  if (!resident || resident.organizationId !== user.organizationId) {
    throw new HttpError(403, 'Invalid resident');
  }

  // Verify property belongs to organization
  const property = await context.entities.Property.findUnique({
    where: { id: args.propertyId },
  });

  if (!property || property.organizationId !== user.organizationId) {
    throw new HttpError(403, 'Invalid property');
  }

  // Verify assigned manager if provided
  if (args.assignedManagerId) {
    const manager = await context.entities.User.findUnique({
      where: { id: args.assignedManagerId },
    });

    if (!manager || manager.organizationId !== user.organizationId) {
      throw new HttpError(403, 'Invalid manager');
    }
  }

  const request = await context.entities.MaintenanceRequest.create({
    data: {
      residentId: args.residentId,
      propertyId: args.propertyId,
      unitNumber: args.unitNumber,
      requestType: args.requestType as any,
      title: args.title,
      description: args.description,
      priority: (args.priority as any) || 'MEDIUM',
      status: 'SUBMITTED',
      assignedManagerId: args.assignedManagerId,
      assignedToPhone: args.assignedToPhone,
      assignedToName: args.assignedToName,
      organizationId: user.organizationId,
    },
    include: {
      resident: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          email: true,
        },
      },
      property: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      assignedManager: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });

  return request;
};

// ============================================
// UPDATE MAINTENANCE REQUEST
// ============================================
export const updateMaintenanceRequest = async (
  args: {
    id: string;
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    assignedManagerId?: string;
    assignedToPhone?: string;
    assignedToName?: string;
    resolutionNotes?: string;
    residentSatisfaction?: number;
    residentFeedback?: string;
  },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  const user = await context.entities.User.findUnique({
    where: { id: context.user.id },
  });

  if (!user || !user.organizationId) {
    throw new HttpError(403, 'User must belong to an organization');
  }

  const request = await context.entities.MaintenanceRequest.findUnique({
    where: { id: args.id },
  });

  if (!request) {
    throw new HttpError(404, 'Maintenance request not found');
  }

  if (request.organizationId !== user.organizationId) {
    throw new HttpError(403, 'Access denied');
  }

  const { id, ...updateData } = args;

  // Fix type issues for enum fields
  const processedData: any = { ...updateData };
  if (processedData.priority) {
    processedData.priority = processedData.priority as any;
  }
  if (processedData.status) {
    processedData.status = processedData.status as any;
    
    // If marking as completed, set completedAt
    if (processedData.status === 'COMPLETED' || processedData.status === 'CLOSED') {
      processedData.completedAt = new Date();
    }
  }

  const updatedRequest = await context.entities.MaintenanceRequest.update({
    where: { id },
    data: processedData,
    include: {
      resident: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          email: true,
        },
      },
      property: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      assignedManager: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });

  return updatedRequest;
};

// ============================================
// UPDATE MAINTENANCE STATUS
// ============================================
export const updateMaintenanceStatus = async (
  args: {
    id: string;
    status: string;
    resolutionNotes?: string;
  },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  const request = await context.entities.MaintenanceRequest.findUnique({
    where: { id: args.id },
  });

  if (!request) {
    throw new HttpError(404, 'Maintenance request not found');
  }

  // No need to fetch user entity - we already have context.user.id
  // Just verify the request belongs to the user's organization
  const userFromContext = context.user;
  if (!userFromContext.organizationId || request.organizationId !== userFromContext.organizationId) {
    throw new HttpError(403, 'Access denied');
  }

  const updateData: any = {
    status: args.status as any,
  };

  if (args.resolutionNotes) {
    updateData.resolutionNotes = args.resolutionNotes;
  }

  // Set completedAt if marking as completed/closed
  if (args.status === 'COMPLETED' || args.status === 'CLOSED') {
    updateData.completedAt = new Date();
  }

  const updatedRequest = await context.entities.MaintenanceRequest.update({
    where: { id: args.id },
    data: updateData,
    include: {
      resident: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
        },
      },
      property: {
        select: {
          id: true,
          name: true,
        },
      },
      assignedManager: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });

  // Create a conversation log for the status change
  await context.entities.Conversation.create({
    data: {
      residentId: request.residentId,
      messageContent: `Maintenance request "${request.title}" status changed to ${args.status}${
        args.resolutionNotes ? `: ${args.resolutionNotes}` : ''
      }`,
      messageType: 'IN_APP',
      senderType: 'SYSTEM',
      senderId: context.user.id,
      status: 'SENT',
      organizationId: request.organizationId,
    },
  });

  return updatedRequest;
};

// ============================================
// ASSIGN MAINTENANCE REQUEST
// ============================================
export const assignMaintenanceRequest = async (
  args: {
    requestId: string;
    managerId?: string;
    contractorPhone?: string;
    contractorName?: string;
  },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  const user = await context.entities.User.findUnique({
    where: { id: context.user.id },
  });

  if (!user || !user.organizationId) {
    throw new HttpError(403, 'User must belong to an organization');
  }

  const request = await context.entities.MaintenanceRequest.findUnique({
    where: { id: args.requestId },
  });

  if (!request) {
    throw new HttpError(404, 'Maintenance request not found');
  }

  if (request.organizationId !== user.organizationId) {
    throw new HttpError(403, 'Access denied');
  }

  // Verify manager if provided
  if (args.managerId) {
    const manager = await context.entities.User.findUnique({
      where: { id: args.managerId },
    });

    if (!manager || manager.organizationId !== user.organizationId) {
      throw new HttpError(403, 'Invalid manager');
    }
  }

  const updatedRequest = await context.entities.MaintenanceRequest.update({
    where: { id: args.requestId },
    data: {
      assignedManagerId: args.managerId,
      assignedToPhone: args.contractorPhone,
      assignedToName: args.contractorName,
      status: 'ASSIGNED',
    },
    include: {
      resident: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
        },
      },
      property: {
        select: {
          id: true,
          name: true,
        },
      },
      assignedManager: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });

  return updatedRequest;
};

// ============================================
// DELETE MAINTENANCE REQUEST
// ============================================
export const deleteMaintenanceRequest = async (
  args: { id: string },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  const user = await context.entities.User.findUnique({
    where: { id: context.user.id },
  });

  if (!user || !user.organizationId) {
    throw new HttpError(403, 'User must belong to an organization');
  }

  const request = await context.entities.MaintenanceRequest.findUnique({
    where: { id: args.id },
  });

  if (!request) {
    throw new HttpError(404, 'Maintenance request not found');
  }

  if (request.organizationId !== user.organizationId) {
    throw new HttpError(403, 'Access denied');
  }

  // Only allow deletion of SUBMITTED or CANCELLED requests
  if (!['SUBMITTED', 'CANCELLED'].includes(request.status)) {
    throw new HttpError(
      400,
      'Can only delete requests that are submitted or cancelled'
    );
  }

  await context.entities.MaintenanceRequest.delete({
    where: { id: args.id },
  });

  return { success: true };
};
