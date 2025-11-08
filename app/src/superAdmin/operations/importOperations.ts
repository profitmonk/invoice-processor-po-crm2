import { HttpError } from 'wasp/server';

export const importPropertiesCSV = async (args: any, context: any) => {
  if (!context.user?.isSuperAdmin) {
    throw new HttpError(403, 'Super Admin only');
  }

  const { organizationId, csvData } = args;
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',').map((h: string) => h.trim());
  
  let imported = 0;
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v: string) => v.trim());
    const row: any = {};
    headers.forEach((h: string, idx: number) => row[h] = values[idx]);
    
    await context.entities.Property.create({
      data: {
        organizationId,
        code: row.code,
        name: row.name,
        address: row.address || '',
        city: row.city || '',
        state: row.state || '',
        zipCode: row.zipCode || '',
      },
    });
    imported++;
  }

  return { success: true, imported };
};

export const importResidentsCSV = async (args: any, context: any) => {
  if (!context.user?.isSuperAdmin) {
    throw new HttpError(403, 'Super Admin only');
  }

  const { propertyId, csvData } = args;
  const property = await context.entities.Property.findUnique({ where: { id: propertyId } });
  
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',').map((h: string) => h.trim());
  
  let imported = 0;
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v: string) => v.trim());
    const row: any = {};
    headers.forEach((h: string, idx: number) => row[h] = values[idx]);
    
    await context.entities.Resident.create({
      data: {
        propertyId,
        organizationId: property!.organizationId,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        phoneNumber: row.phoneNumber,
        unitNumber: row.unitNumber,
        monthlyRentAmount: parseFloat(row.monthlyRentAmount) || 0,
        leaseStartDate: new Date(row.leaseStartDate),
        leaseEndDate: new Date(row.leaseEndDate),
        moveInDate: new Date(row.leaseStartDate),
        leaseType: 'FIXED_TERM',
        status: 'ACTIVE',
      },
    });
    imported++;
  }

  return { success: true, imported };
};
