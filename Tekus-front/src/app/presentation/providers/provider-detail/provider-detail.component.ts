import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Provider } from '../../../core/models/provider.model';
import { Service } from '../../../core/models/service.model';
import { ProviderMockService } from '../../../infrastructure/services/providers/provider-mock.service';
import { ServiceMockService } from '../../../infrastructure/services/services/service-mock.service';

@Component({
  selector: 'app-provider-detail',
  templateUrl: './provider-detail.component.html',
  styleUrls: ['./provider-detail.component.scss']
})
export class ProviderDetailComponent implements OnInit {
  
  provider: Provider | null = null;
  services: Service[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private providerService: ProviderMockService,
    private serviceService: ServiceMockService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProvider(id);
    }
  }

  loadProvider(id: string): void {
    this.loading = true;
    this.providerService.getProviderById(id).subscribe({
      next: (provider) => {
        if (provider) {
          this.provider = provider;
          this.loadServices(provider.services || []);
        } else {
          this.router.navigate(['/providers']);
        }
      },
      error: (error) => {
        console.error('Error loading provider:', error);
        this.loading = false;
        this.router.navigate(['/providers']);
      }
    });
  }

  loadServices(serviceIds: string[]): void {
    if (serviceIds.length === 0) {
      this.loading = false;
      return;
    }

    this.serviceService.getServices(1, 100).subscribe({
      next: (result) => {
        this.services = result.data.filter((s: Service) => serviceIds.includes(s.id));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading services:', error);
        this.loading = false;
      }
    });
  }

  editProvider(): void {
    if (this.provider) {
      this.router.navigate(['/providers/edit', this.provider.id]);
    }
  }

  deleteProvider(): void {
    if (this.provider && confirm(`¿Está seguro de eliminar el proveedor "${this.provider.name}"?`)) {
      this.providerService.deleteProvider(this.provider.id).subscribe({
        next: (success) => {
          if (success) {
            this.router.navigate(['/providers']);
          }
        },
        error: (error) => {
          console.error('Error deleting provider:', error);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/providers']);
  }

  getCountriesForService(service: Service): string {
    return service.countries?.map(c => c.flag + ' ' + c.name).join(', ') || 'N/A';
  }
}
