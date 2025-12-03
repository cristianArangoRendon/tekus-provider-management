import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Provider } from '../../../core/models/provider.model';
import { ProviderMockService } from '../../../infrastructure/services/providers/provider-mock.service';
import { TableResultDTO } from '../../../core/data-transfer-object/common/table-result/table-result.dto';

@Component({
  selector: 'app-provider-list',
  templateUrl: './provider-list.component.html',
  styleUrls: ['./provider-list.component.scss']
})
export class ProviderListComponent implements OnInit {
  
  providers: Provider[] = [];
  displayedColumns: string[] = ['nit', 'name', 'email', 'servicesCount', 'createdAt', 'actions'];
  
  // Paginación
  totalRecords = 0;
  page = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  
  // Búsqueda y ordenamiento
  searchTerm = '';
  sortBy = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';
  
  loading = false;

  constructor(
    private providerService: ProviderMockService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadProviders();
  }

  loadProviders(): void {
    this.loading = true;
    this.providerService.getProviders(this.page, this.pageSize, this.searchTerm, this.sortBy, this.sortOrder)
      .subscribe({
        next: (result: TableResultDTO<Provider>) => {
          this.providers = result.data;
          this.totalRecords = result.totalRecords;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading providers:', error);
          this.loading = false;
        }
      });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.page = 1; // Reset a la primera página
    this.loadProviders();
  }

  onSort(column: string): void {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.loadProviders();
  }

  onPageChange(event: any): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadProviders();
  }

  createProvider(): void {
    this.router.navigate(['/providers/create']);
  }

  editProvider(provider: Provider): void {
    this.router.navigate(['/providers/edit', provider.id]);
  }

  viewProvider(provider: Provider): void {
    this.router.navigate(['/providers', provider.id]);
  }

  deleteProvider(provider: Provider): void {
    if (confirm(`¿Está seguro de eliminar el proveedor "${provider.name}"?`)) {
      this.loading = true;
      this.providerService.deleteProvider(provider.id).subscribe({
        next: (success) => {
          if (success) {
            this.loadProviders();
          }
        },
        error: (error) => {
          console.error('Error deleting provider:', error);
          this.loading = false;
        }
      });
    }
  }

  getSortIcon(column: string): string {
    if (this.sortBy !== column) {
      return 'unfold_more';
    }
    return this.sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }
}
