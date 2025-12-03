import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Provider, CustomField } from '../../../core/models/provider.model';
import { TableResultDTO } from '../../../core/data-transfer-object/common/table-result/table-result.dto';

@Injectable({
  providedIn: 'root'
})
export class ProviderMockService {

  private providers: Provider[] = [
    {
      id: '1',
      nit: '900123456-1',
      name: 'Importaciones Tekus S.A.S.',
      email: 'contacto@tekus.com',
      createdAt: new Date('2024-01-15'),
      services: ['1', '2'],
      customFields: [
        { id: '1', key: 'Número de contacto en marte', value: '+1-555-MARS', type: 'text' },
        { id: '2', key: 'Cantidad de mascotas en la nómina', value: '5', type: 'number' }
      ]
    },
    {
      id: '2',
      nit: '900234567-2',
      name: 'TechGlobal Solutions',
      email: 'info@techglobal.com',
      createdAt: new Date('2024-02-20'),
      services: ['3', '4'],
      customFields: [
        { id: '3', key: 'Sede principal', value: 'Bogotá', type: 'text' },
        { id: '4', key: 'Años de experiencia', value: '15', type: 'number' }
      ]
    },
    {
      id: '3',
      nit: '900345678-3',
      name: 'CloudServices Inc.',
      email: 'contact@cloudservices.com',
      createdAt: new Date('2024-03-10'),
      services: ['5', '6'],
      customFields: [
        { id: '5', key: 'Certificaciones', value: 'AWS, Azure, GCP', type: 'text' }
      ]
    },
    {
      id: '4',
      nit: '900456789-4',
      name: 'DataAnalytics Pro',
      email: 'hello@dataanalytics.com',
      createdAt: new Date('2024-04-05'),
      services: ['7'],
      customFields: []
    },
    {
      id: '5',
      nit: '900567890-5',
      name: 'SecureNet Systems',
      email: 'security@securenet.com',
      createdAt: new Date('2024-05-12'),
      services: ['8', '9'],
      customFields: [
        { id: '6', key: 'Nivel de seguridad', value: 'Enterprise', type: 'text' }
      ]
    },
    {
      id: '6',
      nit: '900678901-6',
      name: 'AI Innovations Lab',
      email: 'lab@aiinnovations.com',
      createdAt: new Date('2024-06-18'),
      services: ['10'],
      customFields: [
        { id: '7', key: 'Proyectos activos', value: '12', type: 'number' }
      ]
    },
    {
      id: '7',
      nit: '900789012-7',
      name: 'Mobile First Dev',
      email: 'dev@mobilefirst.com',
      createdAt: new Date('2024-07-22'),
      services: ['1', '3'],
      customFields: []
    },
    {
      id: '8',
      nit: '900890123-8',
      name: 'Blockchain Solutions',
      email: 'crypto@blockchain.com',
      createdAt: new Date('2024-08-30'),
      services: ['2', '5'],
      customFields: [
        { id: '8', key: 'Blockchain soportadas', value: 'Ethereum, Solana', type: 'text' }
      ]
    },
    {
      id: '9',
      nit: '900901234-9',
      name: 'IoT Experts',
      email: 'iot@experts.com',
      createdAt: new Date('2024-09-15'),
      services: ['6', '8'],
      customFields: []
    },
    {
      id: '10',
      nit: '900012345-0',
      name: 'DevOps Masters',
      email: 'ops@devopsmasters.com',
      createdAt: new Date('2024-10-01'),
      services: ['4', '7', '9'],
      customFields: [
        { id: '9', key: 'Pipeline automatizados', value: '50', type: 'number' }
      ]
    }
  ];

  constructor() { }

  getProviders(
    page: number = 1, 
    pageSize: number = 10, 
    search: string = '', 
    sortBy: string = 'name', 
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Observable<TableResultDTO<Provider>> {
    
    let filteredProviders = [...this.providers];

    // Búsqueda
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProviders = filteredProviders.filter(provider =>
        provider.name.toLowerCase().includes(searchLower) ||
        provider.email.toLowerCase().includes(searchLower) ||
        provider.nit.toLowerCase().includes(searchLower)
      );
    }

    // Ordenamiento
    filteredProviders.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'nit':
          comparison = a.nit.localeCompare(b.nit);
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
    const paginatedProviders = filteredProviders.slice(startIndex, endIndex);

    const result: TableResultDTO<Provider> = {
      data: paginatedProviders,
      totalRecords: filteredProviders.length,
    };

    return of(result).pipe(delay(500)); // Simular latencia de red
  }

  getProviderById(id: string): Observable<Provider | undefined> {
    const provider = this.providers.find(p => p.id === id);
    return of(provider).pipe(delay(300));
  }

  createProvider(provider: Omit<Provider, 'id' | 'createdAt'>): Observable<Provider> {
    const newProvider: Provider = {
      ...provider,
      id: (this.providers.length + 1).toString(),
      createdAt: new Date(),
      customFields: provider.customFields || [],
      services: provider.services || []
    };
    
    this.providers.push(newProvider);
    return of(newProvider).pipe(delay(500));
  }

  updateProvider(id: string, provider: Partial<Provider>): Observable<Provider | undefined> {
    const index = this.providers.findIndex(p => p.id === id);
    
    if (index !== -1) {
      this.providers[index] = { ...this.providers[index], ...provider };
      return of(this.providers[index]).pipe(delay(500));
    }
    
    return of(undefined).pipe(delay(500));
  }

  deleteProvider(id: string): Observable<boolean> {
    const index = this.providers.findIndex(p => p.id === id);
    
    if (index !== -1) {
      this.providers.splice(index, 1);
      return of(true).pipe(delay(500));
    }
    
    return of(false).pipe(delay(500));
  }

  addCustomField(providerId: string, customField: Omit<CustomField, 'id'>): Observable<Provider | undefined> {
    const provider = this.providers.find(p => p.id === providerId);
    
    if (provider) {
      const newCustomField: CustomField = {
        ...customField,
        id: `cf-${Date.now()}`
      };
      
      if (!provider.customFields) {
        provider.customFields = [];
      }
      
      provider.customFields.push(newCustomField);
      return of(provider).pipe(delay(300));
    }
    
    return of(undefined).pipe(delay(300));
  }

  removeCustomField(providerId: string, customFieldId: string): Observable<Provider | undefined> {
    const provider = this.providers.find(p => p.id === providerId);
    
    if (provider && provider.customFields) {
      provider.customFields = provider.customFields.filter(cf => cf.id !== customFieldId);
      return of(provider).pipe(delay(300));
    }
    
    return of(undefined).pipe(delay(300));
  }
}
