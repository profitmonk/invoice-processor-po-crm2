// src/crm/types/lead.ts

export interface Property {
  id: string;
  name: string;
}

export interface User {
  id: string;
  username?: string;
  email: string;
}

export interface Conversation {
  id: string;
  messageContent: string;
  senderType: string;
  sentAt: string;
  aiGenerated: boolean;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status: string;
  priority: string;
  interestedProperty?: Property;
  budgetMin?: number;
  budgetMax?: number;
  desiredBedrooms?: number;
  assignedManager?: User;
  conversations?: Conversation[];
  _count?: {
    conversations: number;
  };
}
