export interface CountryProvidersDTO {
  country: string;
  totalProviders: number;
}

export interface CountryServicesDTO {
  country: string;
  totalServices: number;
}

export interface DashboardSummaryDTO {
  totalProviders: number;
  totalServices: number;
  providersByCountry: CountryProvidersDTO[];
  servicesByCountry: CountryServicesDTO[];
}