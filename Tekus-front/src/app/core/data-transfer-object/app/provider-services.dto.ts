export interface AssignServiceToProviderDTO {
  providerId: number;
  serviceId: number;
  countryCodes: string;
}


export interface ProviderServiceResponseDTO {
  providerServiceId?: number;
}