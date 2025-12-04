import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PageEvent } from '@angular/material/paginator';
import {
  ServicePagedDTO,
  GetServicesPagedDTO,
} from '../../../core/data-transfer-object/app/services.dto';
import { ServicesUseCase } from '../../../infrastructure/use-cases/app/services.usecase';
import {
  trigger,
  transition,
  style,
  animate,
  stagger,
  query,
} from '@angular/animations';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
    trigger('staggerFadeIn', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(80, [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
          ]),
        ], { optional: true }),
      ]),
    ]),
  ],
})
export class ServiceListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  services: ServicePagedDTO[] = [];
  displayedColumns: string[] = [
    'icon',
    'serviceName',
    'description',
    'hourlyRateUSD',
    'createdAt',
    'actions',
  ];

  totalRecords = 0;
  page = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];

  searchTerm = '';
  sortBy = 'ServiceName';
  sortOrder: 'ASC' | 'DESC' = 'ASC';

  loading = false;
  viewMode: 'grid' | 'table' = 'grid';

  constructor(
    private servicesUseCase: ServicesUseCase,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadServices();
    const savedViewMode = localStorage.getItem('servicesViewMode');
    if (savedViewMode === 'grid' || savedViewMode === 'table') {
      this.viewMode = savedViewMode;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadServices(): void {
    this.loading = true;

    const filters: GetServicesPagedDTO = {
      searchTerm: this.searchTerm || undefined,
      pageNumber: this.page,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
    };

    this.servicesUseCase
      .GetServicesPaged(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result) {
            this.services = result.results;
            this.totalRecords = result.totalRecords;
          } else {
            this.services = [];
            this.totalRecords = 0;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading services:', error);
          this.services = [];
          this.loading = false;
        },
      });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.page = 1;
    this.loadServices();
  }

  onSort(column: string): void {
    const columnMap: { [key: string]: string } = {
      serviceName: 'ServiceName',
      hourlyRateUSD: 'HourlyRateUSD',
      description: 'Description',
      createdAt: 'CreatedAt',
    };

    const backendColumn = columnMap[column] || column;

    if (this.sortBy === backendColumn) {
      this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortBy = backendColumn;
      this.sortOrder = 'ASC';
    }
    this.loadServices();
  }

  setSortBy(column: string): void {
    const columnMap: { [key: string]: string } = {
      serviceName: 'ServiceName',
      hourlyRateUSD: 'HourlyRateUSD',
      createdAt: 'CreatedAt',
    };

    this.sortBy = columnMap[column] || column;
    this.sortOrder = 'ASC';
    this.loadServices();
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadServices();
  }

  createService(): void {
    this.router.navigate(['/services/create']);
  }

  editService(service: ServicePagedDTO): void {
    this.router.navigate(['/services/edit', service.serviceId]);
  }

  deleteService(service: ServicePagedDTO): void {
    const confirmMessage = `¿Está seguro de eliminar el servicio "${service.serviceName}"?`;

    if (confirm(confirmMessage)) {
      this.loading = true;

      this.servicesUseCase
        .DeleteService(service.serviceId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            if (success) {
              this.loadServices();
            } else {
              this.loading = false;
            }
          },
          error: (error) => {
            console.error('Error deleting service:', error);
            this.loading = false;
          },
        });
    }
  }

  formatRate(rate: number): string {
    return `$${rate.toFixed(2)}`;
  }

  getSortIcon(column: string): string {
    const columnMap: { [key: string]: string } = {
      serviceName: 'ServiceName',
      hourlyRateUSD: 'HourlyRateUSD',
      description: 'Description',
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
    this.loadServices();
  }

  refreshServices(): void {
    this.loadServices();
  }

  getAverageRate(): number {
    if (this.services.length === 0) return 0;
    const sum = this.services.reduce((acc, service) => acc + service.hourlyRateUSD, 0);
    return sum / this.services.length;
  }

  getMaxRate(): number {
    if (this.services.length === 0) return 0;
    return Math.max(...this.services.map(s => s.hourlyRateUSD));
  }

  ngAfterViewInit(): void {
    // Watch for view mode changes and save to localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const viewModeObserver = new MutationObserver(() => {
        localStorage.setItem('servicesViewMode', this.viewMode);
      });
    }
  }
}
