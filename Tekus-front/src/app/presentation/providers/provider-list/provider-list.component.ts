import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PageEvent } from '@angular/material/paginator';
import {
  ProviderPagedDTO,
  GetProvidersPagedDTO,
} from '../../../core/data-transfer-object/app/providers.dto';
import { ProvidersUseCase } from '../../../infrastructure/use-cases/app/providers.usecase';

@Component({
  selector: 'app-provider-list',
  templateUrl: './provider-list.component.html',
  styleUrls: ['./provider-list.component.scss']
})
export class ProviderListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  providers: ProviderPagedDTO[] = [];
  displayedColumns: string[] = [
    'avatar',
    'nit',
    'providerName',
    'email',
    'totalServices',
    'createdAt',
    'actions',
  ];

  totalRecords = 0;
  page = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];

  searchTerm = '';
  sortBy = 'ProviderName';
  sortOrder: 'ASC' | 'DESC' = 'ASC';

  loading = false;
  viewMode: 'grid' | 'table' = 'grid';
  activeFiltersCount = 0;

  constructor(
    private providersUseCase: ProvidersUseCase,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProviders();
    const savedViewMode = localStorage.getItem('providersViewMode');
    if (savedViewMode === 'grid' || savedViewMode === 'table') {
      this.viewMode = savedViewMode;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProviders(): void {
    this.loading = true;

    const filters: GetProvidersPagedDTO = {
      searchTerm: this.searchTerm || undefined,
      pageNumber: this.page,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
    };

    this.providersUseCase
      .GetProvidersPaged(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result) {
            this.providers = result.results;
            this.totalRecords = result.totalRecords;
          } else {
            this.providers = [];
            this.totalRecords = 0;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading providers:', error);
          this.providers = [];
          this.loading = false;
        },
      });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.page = 1;
    this.loadProviders();
  }

  onSort(column: string): void {
    const columnMap: { [key: string]: string } = {
      nit: 'Nit',
      providerName: 'ProviderName',
      email: 'Email',
      totalServices: 'TotalServices',
      createdAt: 'CreatedAt',
    };

    const backendColumn = columnMap[column] || column;

    if (this.sortBy === backendColumn) {
      this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortBy = backendColumn;
      this.sortOrder = 'ASC';
    }
    this.loadProviders();
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadProviders();
  }

  createProvider(): void {
    this.router.navigate(['/providers/create']);
  }

  editProvider(provider: ProviderPagedDTO): void {
    this.router.navigate(['/providers/edit', provider.providerId]);
  }

  viewProvider(provider: ProviderPagedDTO): void {
    this.router.navigate(['/providers', provider.providerId]);
  }

  deleteProvider(provider: ProviderPagedDTO): void {
    const confirmMessage = `¿Está seguro de eliminar el proveedor "${provider.providerName}"?`;

    if (confirm(confirmMessage)) {
      this.loading = true;

      this.providersUseCase
        .DeleteProvider(provider.providerId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            if (success) {
              this.loadProviders();
            } else {
              this.loading = false;
            }
          },
          error: (error) => {
            console.error('Error deleting provider:', error);
            this.loading = false;
          },
        });
    }
  }

  getSortIcon(column: string): string {
    const columnMap: { [key: string]: string } = {
      nit: 'Nit',
      providerName: 'ProviderName',
      email: 'Email',
      totalServices: 'TotalServices',
      createdAt: 'CreatedAt',
    };

    const backendColumn = columnMap[column] || column;

    if (this.sortBy !== backendColumn) {
      return 'unfold_more';
    }
    return this.sortOrder === 'ASC' ? 'arrow_upward' : 'arrow_downward';
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.page = 1;
    this.activeFiltersCount = 0;
    this.loadProviders();
  }

  clearAllFilters(): void {
    this.searchTerm = '';
    this.page = 1;
    this.sortBy = 'ProviderName';
    this.sortOrder = 'ASC';
    this.activeFiltersCount = 0;
    this.loadProviders();
  }

  refreshProviders(): void {
    this.loadProviders();
  }

  filterByServices(type: 'all' | 'with' | 'without'): void {
    if (type !== 'all') {
      this.activeFiltersCount = 1;
    } else {
      this.activeFiltersCount = 0;
    }
  }

  getActiveProviders(): number {
    return this.totalRecords;
  }

  getTotalServices(): number {
    return this.providers.reduce((sum, provider) => sum + provider.totalServices, 0);
  }

  onViewModeChange(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('providersViewMode', this.viewMode);
    }
  }
}