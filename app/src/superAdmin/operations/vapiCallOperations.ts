import { HttpError } from 'wasp/server';

export const getRecentVapiCalls = async (args: any, context: any) => {
  if (!context.user?.isSuperAdmin) {
    throw new HttpError(403, 'Super Admin only');
  }

  return context.entities.VapiCall.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      property: true,
      maintenanceRequest: true,
      resident: true,
      lead: true,
    },
  });
};
