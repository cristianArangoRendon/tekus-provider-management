export interface Service {
  id: string;
  name: string;
  hourlyRate: number; // Valor por hora en USD
  createdAt: Date;
  countries?: Country[]; // Países donde se ofrece el servicio
  providerId?: string; // ID del proveedor
}

export interface Country {
  code: string;
  name: string;
  flag?: string;
}
