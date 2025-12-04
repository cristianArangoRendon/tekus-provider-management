export interface GetServicesPagedDTO {
  searchTerm?: string;
  isActive?: boolean;
  pageSize?: number;
  pageNumber?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface CreateServiceDTO {
  serviceName: string;
  hourlyRateUSD: number;
  description?: string;
}

export interface UpdateServiceDTO {
  serviceId: number;
  serviceName?: string;
  hourlyRateUSD?: number;
  description?: string;
}

export interface ServicePagedDTO {
  serviceId: number;
  serviceName: string;
  hourlyRateUSD: number;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ServicesPagedResultDTO {
  items: ServicePagedDTO[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}