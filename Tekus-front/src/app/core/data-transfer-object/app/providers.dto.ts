
import { TableResultDTO } from '../common/table-result/table-result.dto';

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
  customFields?: { [key: string]: string };
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
export interface CreateProviderResponseDTO {
  success: boolean;
  providerId: number;
}

export type ProvidersPagedResultDTO = TableResultDTO<ProviderPagedDTO>;