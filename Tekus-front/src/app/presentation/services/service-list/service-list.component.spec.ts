import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ServiceListComponent } from './service-list.component';
import { ServicesUseCase } from '../../../infrastructure/use-cases/app/services.usecase';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ServicePagedDTO } from '../../../core/data-transfer-object/app/services.dto';

import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

describe('ServiceListComponent', () => {
  let component: ServiceListComponent;
  let fixture: ComponentFixture<ServiceListComponent>;
  let servicesUseCaseSpy: jasmine.SpyObj<ServicesUseCase>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockServices: ServicePagedDTO[] = [
    { 
      serviceId: 1, 
      serviceName: 'Consultoría TI', 
      hourlyRateUSD: 50, 
      description: 'Asesoría técnica', 
      createdAt: new Date('2023-01-01') 
    },
    { 
      serviceId: 2, 
      serviceName: 'Desarrollo Web', 
      hourlyRateUSD: 80, 
      description: 'Frontend y Backend', 
      createdAt: new Date('2023-02-01') 
    },
    { 
      serviceId: 3, 
      serviceName: 'Soporte', 
      hourlyRateUSD: 30, 
      description: 'Mantenimiento', 
      createdAt: new Date('2023-03-01') 
    }
  ];

  const mockPagedResult = {
    results: mockServices,
    totalRecords: 3,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1
  };

  beforeEach(async () => {
    servicesUseCaseSpy = jasmine.createSpyObj('ServicesUseCase', ['GetServicesPaged', 'DeleteService']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ ServiceListComponent ],
      imports: [
        NoopAnimationsModule,
        FormsModule,
        MatMenuModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatPaginatorModule,
        MatTableModule,
        MatSortModule,
        MatButtonToggleModule
      ],
      providers: [
        { provide: ServicesUseCase, useValue: servicesUseCaseSpy },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceListComponent);
    component = fixture.componentInstance;

    // Configuración por defecto de espías
    servicesUseCaseSpy.GetServicesPaged.and.returnValue(of(mockPagedResult));
    spyOn(localStorage, 'getItem').and.returnValue('grid');
    spyOn(localStorage, 'setItem');
    
    fixture.detectChanges();
  });

  it('debe crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Inicialización (ngOnInit)', () => {
    it('debe cargar los servicios al iniciar', () => {
      expect(servicesUseCaseSpy.GetServicesPaged).toHaveBeenCalled();
      expect(component.services.length).toBe(3);
      expect(component.totalRecords).toBe(3);
      expect(component.loading).toBeFalse();
    });

    it('debe recuperar el modo de vista desde localStorage', () => {
      expect(localStorage.getItem).toHaveBeenCalledWith('servicesViewMode');
      expect(component.viewMode).toBe('grid');
    });
  });

  describe('Funcionalidad de Carga y Filtros', () => {
    it('loadServices debe manejar errores del servicio', () => {
      servicesUseCaseSpy.GetServicesPaged.and.returnValue(throwError(() => new Error('API Error')));
      spyOn(console, 'error');

      component.loadServices();

      expect(component.loading).toBeFalse();
      expect(component.services).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });

    it('onSearch debe reiniciar la página a 1 y recargar datos', fakeAsync(() => {
      const inputEvent = { target: { value: 'Web' } } as any;
      component.page = 3;
      
      component.onSearch(inputEvent);
      tick();

      expect(component.searchTerm).toBe('Web');
      expect(component.page).toBe(1);
      
      const args = servicesUseCaseSpy.GetServicesPaged.calls.mostRecent().args[0];
      expect(args?.searchTerm).toBe('Web');
    }));

    it('clearFilters debe limpiar búsqueda y recargar', () => {
      component.searchTerm = 'Texto anterior';
      component.clearFilters();

      expect(component.searchTerm).toBe('');
      expect(component.page).toBe(1);
      expect(servicesUseCaseSpy.GetServicesPaged).toHaveBeenCalled();
    });
  });

  describe('Ordenamiento (Sorting)', () => {
    it('onSort debe alternar el orden (ASC/DESC) en la misma columna', () => {
      component.sortBy = 'ServiceName';
      component.sortOrder = 'ASC';

      component.onSort('serviceName');

      expect(component.sortOrder).toBe('DESC');
      expect(servicesUseCaseSpy.GetServicesPaged).toHaveBeenCalled();
    });

    it('setSortBy debe establecer una columna específica y reiniciar a ASC', () => {
      component.sortBy = 'ServiceName';
      component.setSortBy('hourlyRateUSD');

      expect(component.sortBy).toBe('HourlyRateUSD');
      expect(component.sortOrder).toBe('ASC');
    });

    it('getSortIcon debe retornar el icono correcto', () => {
      component.sortBy = 'ServiceName';
      component.sortOrder = 'ASC';
      
      expect(component.getSortIcon('serviceName')).toBe('arrow_upward');
      
      component.sortOrder = 'DESC';
      expect(component.getSortIcon('serviceName')).toBe('arrow_downward');
      
      expect(component.getSortIcon('hourlyRateUSD')).toBe('unfold_more');
    });
  });

  describe('Paginación', () => {
    it('onPageChange debe actualizar parámetros y recargar', () => {
      const event: PageEvent = { pageIndex: 1, pageSize: 50, length: 100 };
      
      component.onPageChange(event);

      expect(component.page).toBe(2); // (1 + 1)
      expect(component.pageSize).toBe(50);
      expect(servicesUseCaseSpy.GetServicesPaged).toHaveBeenCalled();
    });
  });

  describe('Navegación', () => {
    it('createService debe navegar a la ruta de creación', () => {
      component.createService();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/services/create']);
    });

    it('editService debe navegar a la ruta de edición con ID', () => {
      const service = mockServices[0];
      component.editService(service);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/services/edit', service.serviceId]);
    });
  });

  describe('Eliminación (Delete)', () => {
    it('NO debe eliminar si se cancela la confirmación', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.deleteService(mockServices[0]);
      
      expect(servicesUseCaseSpy.DeleteService).not.toHaveBeenCalled();
    });

    it('debe eliminar y recargar si se confirma', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      // Simular delay para probar el loading
      servicesUseCaseSpy.DeleteService.and.returnValue(of(true).pipe(delay(50)));

      component.deleteService(mockServices[0]);

      expect(component.loading).toBeTrue();
      tick(50);

      expect(servicesUseCaseSpy.DeleteService).toHaveBeenCalledWith(1);
      // 1 llamada inicial + 1 llamada tras borrar
      expect(servicesUseCaseSpy.GetServicesPaged).toHaveBeenCalledTimes(2);
      expect(component.loading).toBeFalse();
    }));

    it('debe manejar errores en la eliminación', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      servicesUseCaseSpy.DeleteService.and.returnValue(throwError(() => new Error('Error')));
      spyOn(console, 'error');

      component.deleteService(mockServices[0]);

      expect(component.loading).toBeFalse();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Cálculo de KPIs y Utilidades', () => {
    it('getAverageRate debe calcular el promedio correctamente', () => {
      // (50 + 80 + 30) / 3 = 160 / 3 = 53.333
      const avg = component.getAverageRate();
      expect(avg).toBeCloseTo(53.33, 2);
    });

    it('getAverageRate debe retornar 0 si no hay servicios', () => {
      component.services = [];
      expect(component.getAverageRate()).toBe(0);
    });

    it('getMaxRate debe retornar la tarifa más alta', () => {
      // Max de [50, 80, 30] es 80
      expect(component.getMaxRate()).toBe(80);
    });

    it('formatRate debe formatear como moneda', () => {
      expect(component.formatRate(50.5)).toBe('$50.50');
    });

    it('onViewModeChange debe guardar preferencia', () => {
      component.viewMode = 'table';
      component.onViewModeChange();
      expect(localStorage.setItem).toHaveBeenCalledWith('servicesViewMode', 'table');
    });
  });
});