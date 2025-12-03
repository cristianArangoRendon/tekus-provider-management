import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Service, Country } from '../../../core/models/service.model';
import { TableResultDTO } from '../../../core/data-transfer-object/common/table-result/table-result.dto';

@Injectable({
  providedIn: 'root'
})
export class ServiceMockService {

  private services: Service[] = [
    {
      id: '1',
      name: 'Descarga espacial de contenidos',
      hourlyRate: 150.00,
      createdAt: new Date('2024-01-15'),
      providerId: '1',
      countries: [
        { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
        { code: 'PE', name: 'Perú', flag: '🇵🇪' },
        { code: 'MX', name: 'México', flag: '🇲🇽' }
      ]
    },
    {
      id: '2',
      name: 'Desaparición forzada de bytes',
      hourlyRate: 200.00,
      createdAt: new Date('2024-01-20'),
      providerId: '1',
      countries: [
        { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
        { code: 'AR', name: 'Argentina', flag: '🇦🇷' }
      ]
    },
    {
      id: '3',
      name: 'Desarrollo de aplicaciones móviles',
      hourlyRate: 120.00,
      createdAt: new Date('2024-02-10'),
      providerId: '2',
      countries: [
        { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
        { code: 'CA', name: 'Canadá', flag: '🇨🇦' },
        { code: 'MX', name: 'México', flag: '🇲🇽' }
      ]
    },
    {
      id: '4',
      name: 'Consultoría en Cloud Computing',
      hourlyRate: 180.00,
      createdAt: new Date('2024-02-25'),
      providerId: '2',
      countries: [
        { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
        { code: 'CL', name: 'Chile', flag: '🇨🇱' },
        { code: 'PE', name: 'Perú', flag: '🇵🇪' }
      ]
    },
    {
      id: '5',
      name: 'Implementación de microservicios',
      hourlyRate: 165.00,
      createdAt: new Date('2024-03-05'),
      providerId: '3',
      countries: [
        { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
        { code: 'EC', name: 'Ecuador', flag: '🇪🇨' }
      ]
    },
    {
      id: '6',
      name: 'DevOps y CI/CD',
      hourlyRate: 175.00,
      createdAt: new Date('2024-03-15'),
      providerId: '3',
      countries: [
        { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
        { code: 'CO', name: 'Colombia', flag: '🇨🇴' }
      ]
    },
    {
      id: '7',
      name: 'Análisis de datos con IA',
      hourlyRate: 220.00,
      createdAt: new Date('2024-04-01'),
      providerId: '4',
      countries: [
        { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
        { code: 'UK', name: 'Reino Unido', flag: '🇬🇧' },
        { code: 'DE', name: 'Alemania', flag: '🇩🇪' }
      ]
    },
    {
      id: '8',
      name: 'Seguridad cibernética',
      hourlyRate: 250.00,
      createdAt: new Date('2024-04-20'),
      providerId: '5',
      countries: [
        { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
        { code: 'CA', name: 'Canadá', flag: '🇨🇦' }
      ]
    },
    {
      id: '9',
      name: 'Desarrollo Blockchain',
      hourlyRate: 280.00,
      createdAt: new Date('2024-05-10'),
      providerId: '5',
      countries: [
        { code: 'SG', name: 'Singapur', flag: '🇸🇬' },
        { code: 'JP', name: 'Japón', flag: '🇯🇵' }
      ]
    },
    {
      id: '10',
      name: 'Machine Learning Operations',
      hourlyRate: 240.00,
      createdAt: new Date('2024-06-01'),
      providerId: '6',
      countries: [
        { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
        { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
        { code: 'BR', name: 'Brasil', flag: '🇧🇷' }
      ]
    }
  ];

  constructor() { }

  getServices(
    page: number = 1,
    pageSize: number = 10,
    search: string = '',
    sortBy: string = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Observable<TableResultDTO<Service>> {
    
    let filteredServices = [...this.services];

    // Búsqueda
    if (search) {
      const searchLower = search.toLowerCase();
      filteredServices = filteredServices.filter(service =>
        service.name.toLowerCase().includes(searchLower) ||
        service.hourlyRate.toString().includes(searchLower)
      );
    }

    // Ordenamiento
    filteredServices.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'hourlyRate':
          comparison = a.hourlyRate - b.hourlyRate;
          break;
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Paginación
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedServices = filteredServices.slice(startIndex, endIndex);

    const result: TableResultDTO<Service> = {
      data: paginatedServices,
      totalRecords: filteredServices.length,
    };

    return of(result).pipe(delay(500));
  }

  getServiceById(id: string): Observable<Service | undefined> {
    const service = this.services.find(s => s.id === id);
    return of(service).pipe(delay(300));
  }

  getServicesByProvider(providerId: string): Observable<Service[]> {
    const services = this.services.filter(s => s.providerId === providerId);
    return of(services).pipe(delay(300));
  }

  createService(service: Omit<Service, 'id' | 'createdAt'>): Observable<Service> {
    const newService: Service = {
      ...service,
      id: (this.services.length + 1).toString(),
      createdAt: new Date(),
      countries: service.countries || []
    };
    
    this.services.push(newService);
    return of(newService).pipe(delay(500));
  }

  updateService(id: string, service: Partial<Service>): Observable<Service | undefined> {
    const index = this.services.findIndex(s => s.id === id);
    
    if (index !== -1) {
      this.services[index] = { ...this.services[index], ...service };
      return of(this.services[index]).pipe(delay(500));
    }
    
    return of(undefined).pipe(delay(500));
  }

  deleteService(id: string): Observable<boolean> {
    const index = this.services.findIndex(s => s.id === id);
    
    if (index !== -1) {
      this.services.splice(index, 1);
      return of(true).pipe(delay(500));
    }
    
    return of(false).pipe(delay(500));
  }
}
