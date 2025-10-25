// src/crm/types/resident.ts

export interface Property {
  id: string;
  name: string;
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  requestType: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  messageContent: string;
  senderType: string;
  sentAt: string;
  aiGenerated: boolean;
}

export interface Resident {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status: string;
  property: Property;
  unitNumber: string;
  monthlyRentAmount: number;
  leaseType: string;
  rentDueDay: number;
  moveInDate: string;
  leaseStartDate: string;
  leaseEndDate: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  maintenanceRequests?: MaintenanceRequest[];
  conversations?: Conversation[];
}
