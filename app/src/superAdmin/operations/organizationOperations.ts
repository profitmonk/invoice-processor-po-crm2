// app/src/superAdmin/operations/organizationOperations.ts
import type { Organization, User } from 'wasp/entities';
import { HttpError } from 'wasp/server';
import bcrypt from 'bcryptjs';

// ============================================
// GET ALL ORGANIZATIONS
// ============================================

type GetAllOrganizationsInput = {
  search?: string;
  filter?: 'all' | 'active' | 'inactive' | 'vapi_enabled' | 'setup_incomplete';
};

type GetAllOrganizationsOutput = {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  vapiEnabled: boolean;
  setupCompleted: boolean;
  propertyCount: number;
  userCount: number;
  residentCount: number;
  estimatedMonthlyCost: number;
  createdAt: Date;
  properties: Array<{
    id: string;
    name: string;
    vapiPhoneNumber: string | null;
    vapiEnabled: boolean;
  }>;
}[];

export const getAllOrganizationsSuperAdmin = async (
  args: GetAllOrganizationsInput,
  context: any
): Promise<GetAllOrganizationsOutput> => {
  // Check if user is super admin
  if (!context.user?.isSuperAdmin) {
    throw new HttpError(403, 'Super admin access required');
  }

  const { search, filter = 'all' } = args;

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (filter === 'active') {
    where.isActive = true;
  } else if (filter === 'inactive') {
    where.isActive = false;
  } else if (filter === 'vapi_enabled') {
    where.vapiEnabled = true;
  } else if (filter === 'setup_incomplete') {
    where.setupCompleted = false;
  }

  const organizations = await context.entities.Organization.findMany({
    where,
    include: {
      properties: {
        select: {
          id: true,
          name: true,
          vapiPhoneNumber: true,
          vapiEnabled: true,
          estimatedMonthlyCost: true,
        },
      },
      users: {
        select: {
          id: true,
        },
      },
      residents: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return organizations.map((org: any) => ({
    id: org.id,
    name: org.name,
    code: org.code,
    isActive: org.isActive,
    vapiEnabled: org.vapiEnabled,
    setupCompleted: org.setupCompleted,
    propertyCount: org.properties.length,
    userCount: org.users.length,
    residentCount: org.residents.length,
    estimatedMonthlyCost: org.properties.reduce(
      (sum: number, p: any) => sum + (p.estimatedMonthlyCost || 0),
      0
    ),
    createdAt: org.createdAt,
    properties: org.properties,
  }));
};

// ============================================
// GET ORGANIZATION BY ID
// ============================================

type GetOrganizationByIdInput = {
  organizationId: string;
};

export const getOrganizationByIdSuperAdmin = async (
  args: GetOrganizationByIdInput,
  context: any
): Promise<any> => {
  if (!context.user?.isSuperAdmin) {
    throw new HttpError(403, 'Super admin access required');
  }

  const organization = await context.entities.Organization.findUnique({
    where: { id: args.organizationId },
    include: {
      properties: {
        include: {
          residents: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              status: true,
            },
          },
          leads: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              status: true,
            },
          },
          maintenanceRequests: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      },
      users: {
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
        },
      },
    },
  });

  if (!organization) {
    throw new HttpError(404, 'Organization not found');
  }

  return organization;
};

// ============================================
// CREATE ORGANIZATION
// ============================================

type CreateOrganizationInput = {
  name: string;
  code: string;
  adminEmail: string;
  adminPassword?: string; // Optional, will auto-generate if not provided
  timezone?: string;
  businessEmail?: string;
  businessPhone?: string;
};

type CreateOrganizationOutput = {
  organization: Organization;
  adminUser: User;
  generatedPassword?: string;
};

export const createOrganizationSuperAdmin = async (
  args: CreateOrganizationInput,
  context: any
): Promise<CreateOrganizationOutput> => {
  if (!context.user?.isSuperAdmin) {
    throw new HttpError(403, 'Super admin access required');
  }

  const { name, code, adminEmail, adminPassword, timezone, businessEmail, businessPhone } = args;

  // Check if code already exists
  const existing = await context.entities.Organization.findUnique({
    where: { code },
  });

  if (existing) {
    throw new HttpError(400, 'Organization code already exists');
  }

  // Check if admin email already exists
  const existingUser = await context.entities.User.findUnique({
    where: { email: adminEmail },
  });

  if (existingUser) {
    throw new HttpError(400, 'Admin email already exists');
  }

  // Generate password if not provided
  const password = adminPassword || generateRandomPassword();
  //const hashedPassword = await bcrypt.hash(password, 10);

  // Create organization and admin user
  const organization = await context.entities.Organization.create({
    data: {
      name,
      code,
      timezone: timezone || 'America/Los_Angeles',
      businessEmail,
      businessPhone,
      isActive: true,
      setupCompleted: false,
    },
  });

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create admin user
  const adminUser = await context.entities.User.create({
    data: {
      email: adminEmail,
      username: adminEmail.split('@')[0],
      organizationId: organization.id,
      role: 'ADMIN',
      isAdmin: true,
      isSuperAdmin: false,
      hasCompletedOnboarding: true,
      credits: 100,
    },
  });

  // Create Auth identity for email login
  await context.entities.AuthIdentity.create({
    data: {
      providerName: 'email',
      providerUserId: adminEmail,
      authId: adminUser.id,
      providerData: JSON.stringify({
        hashedPassword,
        isEmailVerified: true, // Auto-verify email for admin created users
      }),
    },
  });

  return {
    organization,
    adminUser,
    generatedPassword: adminPassword ? undefined : password,
  };
};

// ============================================
// UPDATE ORGANIZATION
// ============================================

type UpdateOrganizationInput = {
  organizationId: string;
  name?: string;
  timezone?: string;
  businessEmail?: string;
  businessPhone?: string;
  isActive?: boolean;
  vapiEnabled?: boolean;
  setupCompleted?: boolean;
};

export const updateOrganizationSuperAdmin = async (
  args: UpdateOrganizationInput,
  context: any
): Promise<Organization> => {
  if (!context.user?.isSuperAdmin) {
    throw new HttpError(403, 'Super admin access required');
  }

  const { organizationId, ...updateData } = args;

  const organization = await context.entities.Organization.update({
    where: { id: organizationId },
    data: {
      ...updateData,
      updatedAt: new Date(),
    },
  });

  return organization;
};

// ============================================
// DELETE ORGANIZATION
// ============================================

type DeleteOrganizationInput = {
  organizationId: string;
};

export const deleteOrganizationSuperAdmin = async (
  args: DeleteOrganizationInput,
  context: any
): Promise<{ success: boolean }> => {
  if (!context.user?.isSuperAdmin) {
    throw new HttpError(403, 'Super admin access required');
  }

  // Check if organization has any data
  const organization = await context.entities.Organization.findUnique({
    where: { id: args.organizationId },
    include: {
      properties: true,
      users: true,
      residents: true,
    },
  });

  if (!organization) {
    throw new HttpError(404, 'Organization not found');
  }

  if (organization.properties.length > 0) {
    throw new HttpError(400, 'Cannot delete organization with properties. Delete properties first.');
  }

  if (organization.residents.length > 0) {
    throw new HttpError(400, 'Cannot delete organization with residents. Archive residents first.');
  }

  // Soft delete by setting isActive to false
  await context.entities.Organization.update({
    where: { id: args.organizationId },
    data: {
      isActive: false,
      updatedAt: new Date(),
    },
  });

  return { success: true };
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateRandomPassword(): string {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

type AddUserInput = {
  organizationId: string;
  email: string;
  password?: string;
  role: string;
};

export const addUserToOrganizationSuperAdmin = async (
  args: AddUserInput,
  context: any
) => {
  if (!context.user?.isSuperAdmin) {
    throw new HttpError(403, 'Super admin access required');
  }

  const { organizationId, email, password, role } = args;

  // Verify org exists
  const org = await context.entities.Organization.findUnique({
    where: { id: organizationId },
  });

  if (!org) {
    throw new HttpError(404, 'Organization not found');
  }

  // Check if user exists
  const existing = await context.entities.User.findUnique({
    where: { email },
  });

  if (existing) {
    throw new HttpError(400, 'User with this email already exists');
  }

  // Generate password if not provided
  const userPassword = password || generateRandomPassword();

  // Create user
  const user = await context.entities.User.create({
    data: {
      email,
      username: email.split('@')[0],
      organizationId,
      role: role as any,
      isAdmin: role === 'ADMIN',
      isSuperAdmin: false,
      hasCompletedOnboarding: true,
      credits: 100,
    },
  });

  // Hash password
  const hashedPassword = await bcrypt.hash(userPassword, 10);

  // Create Auth identity
  await context.entities.AuthIdentity.create({
    data: {
      providerName: 'email',
      providerUserId: email,
      authId: user.id,
      providerData: JSON.stringify({
        hashedPassword,
        isEmailVerified: true,
      }),
    },
  });

  return {
    user,
    generatedPassword: password ? undefined : userPassword,
  };
};

// ============================================
// GET SYSTEM STATISTICS
// ============================================

export const getSystemStatisticsSuperAdmin = async (
  _args: {},
  context: any
): Promise<any> => {
  if (!context.user?.isSuperAdmin) {
    throw new HttpError(403, 'Super admin access required');
  }

  const [
    totalOrgs,
    activeOrgs,
    totalProperties,
    vapiEnabledProperties,
    totalResidents,
    totalLeads,
  ] = await Promise.all([
    context.entities.Organization.count(),
    context.entities.Organization.count({ where: { isActive: true } }),
    context.entities.Property.count(),
    context.entities.Property.count({ where: { vapiEnabled: true } }),
    context.entities.Resident.count(),
    context.entities.Lead.count(),
  ]);

  // Calculate total monthly cost
  const properties = await context.entities.Property.findMany({
    where: { vapiEnabled: true },
    select: {
      estimatedMonthlyCost: true,
    },
  });

  const totalMonthlyCost = properties.reduce(
    (sum: number, p: any) => sum + (p.estimatedMonthlyCost || 0),
    0
  );

  // Get recent activity - comment out for now
  // const recentCalls = await context.entities.VapiCall.findMany({
  //   take: 10,
  //   orderBy: { createdAt: 'desc' },
  //   include: {
  //     property: { select: { name: true } },
  //     organization: { select: { name: true } },
  //   },
  // });

  return {
    totalOrgs,
    activeOrgs,
    totalProperties,
    vapiEnabledProperties,
    totalResidents,
    totalLeads,
    totalCalls: 0,
    totalCallsThisMonth: 0,
    totalMonthlyCost,
    recentCalls: [],
  };
};
