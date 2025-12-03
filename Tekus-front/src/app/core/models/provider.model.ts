export interface Provider {
  id: string;
  nit: string;
  name: string;
  email: string;
  createdAt: Date;
  customFields?: CustomField[];
  services?: string[]; // IDs de servicios
}

export interface CustomField {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'boolean';
}
