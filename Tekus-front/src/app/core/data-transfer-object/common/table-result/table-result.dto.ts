export interface TableResultDTO<T = any> {
    results: T[];
    totalRecords: number;
}