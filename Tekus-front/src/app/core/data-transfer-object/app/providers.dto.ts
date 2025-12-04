export interface GetProvidersPagedDTO {
  searchTerm?: string;
  isActive?: boolean;
  pageSize?: number;
  pageNumber?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface CreateProviderDTO {
  nit: string;
  providerName: string;
  email: string;
}

export interface AddCustomFieldDTO {
  providerId: number;
  fieldName: string;
  fieldValue: string;
}

export interface ProviderPagedDTO {
  providerId: number;
  nit: string;
  providerName: string;
  email: string;
  customFields: string;
  createdAt: Date;
  updatedAt?: Date;
  totalServices: number;
}

export interface ProvidersPagedResultDTO {
  items: ProviderPagedDTO[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}