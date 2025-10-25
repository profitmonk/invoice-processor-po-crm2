// src/crm/operations/residentOperations.ts

import { HttpError } from 'wasp/server';
import type {
  GetResidents,
  GetResidentById,
  CreateResident,
  UpdateResident,
  DeleteResident,
} from 'wasp/server/operations';

// Define the missing operation type locally
type ImportResidentsFromCSV = any;

// ============================================
// GET ALL RESIDENTS
// ============================================
export const getResidents: GetResidents<
  { 
    propertyId?: string; 
    status?: string;
    searchTerm?: string;
  },
  any
> = async (args, context) => {
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

  if (args.propertyId) {
    whereClause.propertyId = args.propertyId;
  }

  if (args.status) {
    whereClause.status = args.status;
  }

  if (args.searchTerm) {
    whereClause.OR = [
      { firstName: { contains: args.searchTerm, mode: 'insensitive' } },
      { lastName: { contains: args.searchTerm, mode: 'insensitive' } },
      { email: { contains: args.searchTerm, mode: 'insensitive' } },
      { phoneNumber: { contains: args.searchTerm } },
      { unitNumber: { contains: args.searchTerm } },
    ];
  }

  const residents = await context.entities.Resident.findMany({
    where: whereClause,
    include: {
      property: true,
      maintenanceRequests: {
        where: { status: { in: ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS'] } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      _count: {
        select: {
          maintenanceRequests: true,
          conversations: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return residents;
};

// ============================================
// GET RESIDENT BY ID
// ============================================
export const getResidentById: GetResidentById<{ id: string }, any> = async (
  args,
  context
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

  const resident = await context.entities.Resident.findUnique({
    where: { id: args.id },
    include: {
      property: true,
      maintenanceRequests: {
        include: {
          assignedManager: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      conversations: {
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  });

  if (!resident) {
    throw new HttpError(404, 'Resident not found');
  }

  if (resident.organizationId !== user.organizationId) {
    throw new HttpError(403, 'Access denied');
  }

  return resident;
};

// ============================================
// CREATE RESIDENT
// ============================================
export const createResident: CreateResident<
  {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    propertyId: string;
    unitNumber: string;
    moveInDate: string;
    monthlyRentAmount: number;
    rentDueDay?: number;
    leaseStartDate: string;
    leaseEndDate: string;
    leaseType?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
  },
  any
> = async (args, context) => {
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

  // Verify property belongs to organization
  const property = await context.entities.Property.findUnique({
    where: { id: args.propertyId },
  });

  if (!property || property.organizationId !== user.organizationId) {
    throw new HttpError(403, 'Invalid property');
  }

  // Check for duplicate phone number in organization
  const existingResident = await context.entities.Resident.findUnique({
    where: {
      organizationId_phoneNumber: {
        organizationId: user.organizationId,
        phoneNumber: args.phoneNumber,
      },
    },
  });

  if (existingResident) {
    throw new HttpError(400, 'A resident with this phone number already exists');
  }

  const resident = await context.entities.Resident.create({
    data: {
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phoneNumber: args.phoneNumber,
      propertyId: args.propertyId,
      unitNumber: args.unitNumber,
      moveInDate: new Date(args.moveInDate),
      monthlyRentAmount: args.monthlyRentAmount,
      rentDueDay: args.rentDueDay || 1,
      leaseStartDate: new Date(args.leaseStartDate),
      leaseEndDate: new Date(args.leaseEndDate),
      leaseType: args.leaseType as any, // Fix type issue
      emergencyContactName: args.emergencyContactName,
      emergencyContactPhone: args.emergencyContactPhone,
      emergencyContactRelationship: args.emergencyContactRelationship,
      status: 'ACTIVE',
      organizationId: user.organizationId,
    },
    include: {
      property: true,
    },
  });

  return resident;
};

// ============================================
// UPDATE RESIDENT
// ============================================
export const updateResident: UpdateResident<
  {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    unitNumber?: string;
    monthlyRentAmount?: number;
    rentDueDay?: number;
    leaseEndDate?: string;
    status?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
  },
  any
> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  const user = await context.entities.User.findUnique({
    where: { id: context.user.id },
  });

  if (!user || !user.organizationId) {
    throw new HttpError(403, 'User must belong to an organization');
  }

  const resident = await context.entities.Resident.findUnique({
    where: { id: args.id },
  });

  if (!resident) {
    throw new HttpError(404, 'Resident not found');
  }

  if (resident.organizationId !== user.organizationId) {
    throw new HttpError(403, 'Access denied');
  }

  const { id, ...updateData } = args;
  
  // Convert date strings to Date objects
  const processedData: any = { ...updateData };
  if (updateData.leaseEndDate) {
    processedData.leaseEndDate = new Date(updateData.leaseEndDate);
  }

  const updatedResident = await context.entities.Resident.update({
    where: { id },
    data: processedData,
    include: {
      property: true,
    },
  });

  return updatedResident;
};

// ============================================
// DELETE RESIDENT
// ============================================
export const deleteResident: DeleteResident<{ id: string }, any> = async (
  args,
  context
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

  const resident = await context.entities.Resident.findUnique({
    where: { id: args.id },
  });

  if (!resident) {
    throw new HttpError(404, 'Resident not found');
  }

  if (resident.organizationId !== user.organizationId) {
    throw new HttpError(403, 'Access denied');
  }

  // Delete associated conversations and maintenance requests (cascading)
  await context.entities.Resident.delete({
    where: { id: args.id },
  });

  return { success: true };
};

// ============================================
// IMPORT RESIDENTS FROM CSV
// ============================================
export const importResidentsFromCSV: ImportResidentsFromCSV = async (
  args: { // Add this
    residents: Array<{
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      propertyCode: string;
      unitNumber: string;
      moveInDate: string;
      monthlyRentAmount: number;
      leaseStartDate: string;
      leaseEndDate: string;
    }>;
  },
  context: any // Add this
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

  // Get all properties for the organization
  const properties = await context.entities.Property.findMany({
    where: { organizationId: user.organizationId },
  });

  const propertyMap = new Map(properties.map((p: any) => [p.code, p.id]));

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const residentData of args.residents) {
    try {
      const propertyId = propertyMap.get(residentData.propertyCode);
      if (!propertyId) {
        results.failed++;
        results.errors.push(
          `Property code ${residentData.propertyCode} not found`
        );
        continue;
      }

      // Check for duplicate
      const existing = await context.entities.Resident.findUnique({
        where: {
          organizationId_phoneNumber: {
            organizationId: user.organizationId,
            phoneNumber: residentData.phoneNumber,
          },
        },
      });

      if (existing) {
        results.failed++;
        results.errors.push(
          `Resident with phone ${residentData.phoneNumber} already exists`
        );
        continue;
      }

      await context.entities.Resident.create({
        data: {
          firstName: residentData.firstName,
          lastName: residentData.lastName,
          email: residentData.email,
          phoneNumber: residentData.phoneNumber,
          propertyId,
          unitNumber: residentData.unitNumber,
          moveInDate: new Date(residentData.moveInDate),
          monthlyRentAmount: residentData.monthlyRentAmount,
          leaseStartDate: new Date(residentData.leaseStartDate),
          leaseEndDate: new Date(residentData.leaseEndDate),
          status: 'ACTIVE',
          organizationId: user.organizationId,
        },
      });

      results.success++;
    } catch (error: any) {
      results.failed++;
      results.errors.push(
        `Failed to import ${residentData.firstName} ${residentData.lastName}: ${error.message}`
      );
    }
  }

  return results;
};
