import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProviderListComponent } from './provider-list.component';
import { ProvidersUseCase } from '../../../infrastructure/use-cases/app/providers.usecase';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators'; 
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ProviderPagedDTO } from '../../../core/data-transfer-object/app/providers.dto';

import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

describe('ProviderListComponent', () => {
  let component: ProviderListComponent;
  let fixture: ComponentFixture<ProviderListComponent>;
  let providersUseCaseSpy: jasmine.SpyObj<ProvidersUseCase>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockProviders: ProviderPagedDTO[] = [
    { 
      providerId: 1, 
      providerName: 'Tech Solutions', 
      nit: '900123456-1', 
      email: 'contact@tech.com', 
      totalServices: 5, 
      createdAt: new Date('2023-01-01'),
      customFields: '{}'
    },
    { 
      providerId: 2, 
      providerName: 'Logistics SA', 
      nit: '800987654-2', 
      email: 'info@logistics.com', 
      totalServices: 2, 
      createdAt: new Date('2023-02-01'),
      customFields: '{"Zona": "Norte"}'
    }
  ];

  const mockPagedResult = {
    results: mockProviders,
    totalRecords: 2,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1
  };

  beforeEach(async () => {
    providersUseCaseSpy = jasmine.createSpyObj('ProvidersUseCase', ['GetProvidersPaged', 'DeleteProvider']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ ProviderListComponent ],
      imports: [
        NoopAnimationsModule, 
        FormsModule,
        MatMenuModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatPaginatorModule,
        MatTableModule,
        MatSortModule
      ],
      providers: [
        { provide: ProvidersUseCase, useValue: providersUseCaseSpy },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA] 
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderListComponent);
    component = fixture.componentInstance;

    providersUseCaseSpy.GetProvidersPaged.and.returnValue(of(mockPagedResult));

    spyOn(localStorage, 'getItem').and.returnValue('grid');
    spyOn(localStorage, 'setItem');
    
    fixture.detectChanges();
  });

  it('debe crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Inicialización (ngOnInit)', () => {
    it('debe cargar los proveedores al iniciar', () => {
      expect(providersUseCaseSpy.GetProvidersPaged).toHaveBeenCalled();
      expect(component.providers.length).toBe(2);
      expect(component.totalRecords).toBe(2);
      expect(component.loading).toBeFalse();
    });

    it('debe recuperar el modo de vista desde localStorage', () => {
      expect(localStorage.getItem).toHaveBeenCalledWith('providersViewMode');
      expect(component.viewMode).toBe('grid');
    });
  });

  describe('Funcionalidad de Carga y Filtros', () => {
    it('loadProviders debe manejar errores del servicio', () => {
      providersUseCaseSpy.GetProvidersPaged.and.returnValue(throwError(() => new Error('Error backend')));
      spyOn(console, 'error');

      component.loadProviders();

      expect(component.loading).toBeFalse();
      expect(component.providers).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });

    it('onSearch debe reiniciar la página a 1 y recargar datos', fakeAsync(() => {
      const inputEvent = { target: { value: 'Tech' } } as any;
      
      component.page = 5;
      component.onSearch(inputEvent);
      
      tick();

      expect(component.searchTerm).toBe('Tech');
      expect(component.page).toBe(1);
      expect(providersUseCaseSpy.GetProvidersPaged).toHaveBeenCalled();
      
      const args = providersUseCaseSpy.GetProvidersPaged.calls.mostRecent().args[0];
      expect(args?.searchTerm).toBe('Tech');
    }));

    it('clearFilters debe limpiar búsqueda y recargar', () => {
      component.searchTerm = 'Busqueda vieja';
      component.clearFilters();

      expect(component.searchTerm).toBe('');
      expect(component.page).toBe(1);
      expect(providersUseCaseSpy.GetProvidersPaged).toHaveBeenCalled();
    });
  });

  describe('Ordenamiento (Sorting)', () => {
    it('onSort debe cambiar a DESC si se ordena por la misma columna', () => {
      component.sortBy = 'ProviderName';
      component.sortOrder = 'ASC';

      component.onSort('providerName');

      expect(component.sortOrder).toBe('DESC');
      expect(providersUseCaseSpy.GetProvidersPaged).toHaveBeenCalled();
    });

    it('onSort debe cambiar columna y reiniciar a ASC si es una columna nueva', () => {
      component.sortBy = 'ProviderName';
      
      component.onSort('email');

      expect(component.sortBy).toBe('Email');
      expect(component.sortOrder).toBe('ASC');
    });
  });

  describe('Paginación', () => {
    it('onPageChange debe actualizar página/tamaño y recargar', () => {
      const event: PageEvent = { pageIndex: 2, pageSize: 25, length: 100 };
      
      component.onPageChange(event);

      expect(component.page).toBe(3);
      expect(component.pageSize).toBe(25);
      expect(providersUseCaseSpy.GetProvidersPaged).toHaveBeenCalled();
    });
  });

  describe('Navegación', () => {
    it('createProvider debe navegar a la ruta de creación', () => {
      component.createProvider();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/providers/create']);
    });

    it('editProvider debe navegar a la ruta de edición con ID', () => {
      const provider = mockProviders[0];
      component.editProvider(provider);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/providers/edit', provider.providerId]);
    });

    it('viewProvider debe navegar a la ruta de detalle', () => {
      const provider = mockProviders[0];
      component.viewProvider(provider);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/providers', provider.providerId]);
    });
  });

  describe('Eliminación (Delete)', () => {
    it('NO debe eliminar si el usuario cancela la confirmación', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      
      component.deleteProvider(mockProviders[0]);

      expect(window.confirm).toHaveBeenCalled();
      expect(providersUseCaseSpy.DeleteProvider).not.toHaveBeenCalled();
    });

    it('debe eliminar y recargar si el usuario confirma', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      // Usamos delay para que la respuesta no sea instantánea
      providersUseCaseSpy.DeleteProvider.and.returnValue(of(true).pipe(delay(50)));

      component.deleteProvider(mockProviders[0]);

      // Verificamos que loading sea true MIENTRAS se espera la respuesta
      expect(component.loading).toBeTrue();

      tick(50); // Avanzamos el tiempo para completar el delay

      expect(providersUseCaseSpy.DeleteProvider).toHaveBeenCalledWith(1);
      // GetProvidersPaged se llama 2 veces: 1 al inicio, 1 al recargar después de borrar
      expect(providersUseCaseSpy.GetProvidersPaged).toHaveBeenCalledTimes(2);
      expect(component.loading).toBeFalse();
    }));

    it('debe manejar errores al eliminar', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      providersUseCaseSpy.DeleteProvider.and.returnValue(throwError(() => new Error('Error')));
      spyOn(console, 'error');

      component.deleteProvider(mockProviders[0]);

      expect(component.loading).toBeFalse();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Utilidades y KPIs', () => {
    it('getActiveProviders debe retornar el total de registros', () => {
      expect(component.getActiveProviders()).toBe(2);
    });

    it('getTotalServices debe sumar los servicios de todos los proveedores actuales', () => {
      expect(component.getTotalServices()).toBe(7);
    });

    it('onViewModeChange debe guardar en localStorage', () => {
      component.viewMode = 'table';
      component.onViewModeChange();
      expect(localStorage.setItem).toHaveBeenCalledWith('providersViewMode', 'table');
    });

    it('filterByServices debe actualizar el contador de filtros', () => {
      component.filterByServices('with');
      expect(component.activeFiltersCount).toBe(1);

      component.filterByServices('all');
      expect(component.activeFiltersCount).toBe(0);
    });
  });
});