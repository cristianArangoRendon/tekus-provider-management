
export interface DashboardIndicatorsDTO {
  totalProviders: number;
  totalServices: number;
  providersByCountry: CountryIndicatorDTO[];
  topServices: TopServiceDTO[];
  recentProviders: RecentProviderDTO[];
}

export interface CountryIndicatorDTO {
  country: string;
  count: number;
  percentage: number;
}

export interface TopServiceDTO {
  serviceId: number;
  serviceName: string;
  providerCount: number;
  avgHourlyRate: number;
}

export interface RecentProviderDTO {
  providerId: number;
  name: string;
  nit: string;
  email: string;
  servicesCount: number;
  createdAt: Date;
}

export interface ServiceStatisticsDTO {
  totalActive: number;
  avgRate: number;
  maxRate: number;
  minRate: number;
}

export interface ProviderStatisticsDTO {
  totalActive: number;
  withServices: number;
  withoutServices: number;
}

export interface QuickSummaryDTO {
  totalProviders: number;
  totalServices: number;
}