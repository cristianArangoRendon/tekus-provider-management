export interface DashboardIndicators {
  totalProviders: number;
  totalServices: number;
  providersByCountry: CountryIndicator[];
  servicesByCountry: CountryIndicator[];
  topServices: ServiceIndicator[];
  recentProviders: ProviderSummary[];
}

export interface CountryIndicator {
  country: string;
  count: number;
  percentage: number;
}

export interface ServiceIndicator {
  serviceName: string;
  providerCount: number;
  avgHourlyRate: number;
}

export interface ProviderSummary {
  id: string;
  name: string;
  email: string;
  servicesCount: number;
  createdAt: Date;
}
