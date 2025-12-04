export interface CountryDTO {
  code: string;
  name: string;
  officialName: string;
  region: string;
  subRegion: string;
  population: number;
  capitals: string[];
  flagUrl: string;
  languages: string[];
  currency: CurrencyInfoDTO;
}

export interface CurrencyInfoDTO {
  code: string;
  name: string;
  symbol: string;
}

export interface CountryFilterDTO {
  searchTerm?: string;
  region?: string;
  language?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  ascending?: boolean;
}

export interface PagedResultDTO<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}