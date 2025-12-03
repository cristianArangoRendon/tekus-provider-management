import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Service } from '../../../core/models/service.model';
import { ServiceMockService } from '../../../infrastructure/services/services/service-mock.service';
import { TableResultDTO } from '../../../core/data-transfer-object/common/table-result/table-result.dto';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss']
})
export class ServiceListComponent implements OnInit {
  
  services: Service[] = [];
  displayedColumns: string[] = ['name', 'hourlyRate', 'countries', 'createdAt', 'actions'];
  
  totalRecords = 0;
  page = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  
  searchTerm = '';
  sortBy = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';
  
  loading = false;

  constructor(
    private serviceService: ServiceMockService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.loading = true;
    this.serviceService.getServices(this.page, this.pageSize, this.searchTerm, this.sortBy, this.sortOrder)
      .subscribe({
        next: (result: TableResultDTO<Service>) => {
          this.services = result.data;
          this.totalRecords = result.totalRecords;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading services:', error);
          this.loading = false;
        }
      });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.page = 1;
    this.loadServices();
  }

  onSort(column: string): void {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.loadServices();
  }

  onPageChange(event: any): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadServices();
  }

  createService(): void {
    this.router.navigate(['/services/create']);
  }

  editService(service: Service): void {
    this.router.navigate(['/services/edit', service.id]);
  }

  deleteService(service: Service): void {
    if (confirm(`¿Está seguro de eliminar el servicio "${service.name}"?`)) {
      this.loading = true;
      this.serviceService.deleteService(service.id).subscribe({
        next: (success) => {
          if (success) {
            this.loadServices();
          }
        },
        error: (error) => {
          console.error('Error deleting service:', error);
          this.loading = false;
        }
      });
    }
  }

  getCountriesDisplay(service: Service): string {
    return service.countries?.map(c => c.flag).join(' ') || 'N/A';
  }

  getCountriesTooltip(service: Service): string {
    return service.countries?.map(c => c.name).join(', ') || 'Sin países';
  }

  getSortIcon(column: string): string {
    if (this.sortBy !== column) {
      return 'unfold_more';
    }
    return this.sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }
}
