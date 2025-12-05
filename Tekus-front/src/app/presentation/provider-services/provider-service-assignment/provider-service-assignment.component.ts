import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Observable, ReplaySubject } from 'rxjs';
import { takeUntil, take, debounceTime, map, startWith } from 'rxjs/operators';
import { Location } from '@angular/common';
import { ProviderServicesUseCase } from '../../../infrastructure/use-cases/app/provider-services.usecase';
import { ProvidersUseCase } from '../../../infrastructure/use-cases/app/providers.usecase';
import { ServicesUseCase } from '../../../infrastructure/use-cases/app/services.usecase';
import { CountriesUseCase } from '../../../infrastructure/use-cases/app/countries.usecase';
import { NotificationsService } from '../../../infrastructure/services/notifications/notifications.service';
import { AssignServiceToProviderDTO } from '../../../core/data-transfer-object/app/provider-services.dto';
import { ProviderPagedDTO } from '../../../core/data-transfer-object/app/providers.dto';
import { ServicePagedDTO } from '../../../core/data-transfer-object/app/services.dto';
import { CountryDTO } from '../../../core/data-transfer-object/app/countries.dto';

@Component({
  selector: 'app-provider-service-assignment',
  templateUrl: './provider-service-assignment.component.html',
  styleUrls: ['./provider-service-assignment.component.scss']
})
export class ProviderServiceAssignmentComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  assignmentForm!: FormGroup;
  isSubmitting = false;
  isLoadingData = false;

  providers: ProviderPagedDTO[] = [];
  selectedProvider: ProviderPagedDTO | null = null;
  providerFilterCtrl = new FormControl('');
  filteredProviders$ = new ReplaySubject<ProviderPagedDTO[]>(1);

  services: ServicePagedDTO[] = [];
  selectedService: ServicePagedDTO | null = null;
  serviceFilterCtrl = new FormControl('');
  filteredServices$ = new ReplaySubject<ServicePagedDTO[]>(1);

  countries: CountryDTO[] = [];
  selectedCountries: string[] = [];
  countrySearchCtrl = new FormControl('');
  filteredCountries$!: Observable<CountryDTO[]>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private providerServicesUseCase: ProviderServicesUseCase,
    private providersUseCase: ProvidersUseCase,
    private servicesUseCase: ServicesUseCase,
    private countriesUseCase: CountriesUseCase,
    private notificationsService: NotificationsService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadAllData();
    this.setupFilters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForm(): void {
    this.assignmentForm = this.fb.group({
      providerId: [null, [Validators.required, Validators.min(1)]],
      serviceId: [null, [Validators.required, Validators.min(1)]],
      countryCodes: [[], Validators.required],
    });
  }

  loadAllData(): void {
    this.isLoadingData = true;
    this.loadProviders();
    this.loadServices();
    this.loadCountries();
  }

  setupFilters(): void {
    this.providerFilterCtrl.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.filterProviders();
      });

    this.serviceFilterCtrl.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.filterServices();
      });

    this.filteredCountries$ = this.countrySearchCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(search => this.filterCountries(search || ''))
    );
  }

  loadProviders(): void {
    this.providersUseCase
      .GetProvidersPaged({ pageNumber: 1, pageSize: 1000, sortBy: 'ProviderName', sortOrder: 'ASC' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result && result.results) {
            this.providers = result.results;
            this.filteredProviders$.next(this.providers);
          }
        },
        error: (error) => {
          console.error('Error loading providers:', error);
          this.notificationsService.showToastErrorMessage('Error al cargar los proveedores');
        },
      });
  }

  loadServices(): void {
    this.servicesUseCase
      .GetServicesPaged({ pageNumber: 1, pageSize: 1000, sortBy: 'ServiceName', sortOrder: 'ASC' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result && result.results) {
            this.services = result.results;
            this.filteredServices$.next(this.services);
          }
        },
        error: (error) => {
          console.error('Error loading services:', error);
          this.notificationsService.showToastErrorMessage('Error al cargar los servicios');
        },
      });
  }

  loadCountries(): void {
    this.countriesUseCase
      .GetAllCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (data) {
            this.countries = data.sort((a, b) => a.name.localeCompare(b.name));
            this.isLoadingData = false;
          }
        },
        error: (error) => {
          console.error('Error loading countries:', error);
          this.notificationsService.showToastErrorMessage('Error al cargar los países');
          this.isLoadingData = false;
        },
      });
  }

  filterProviders(): void {
    const search = this.providerFilterCtrl.value?.toLowerCase() || '';
    if (!search) {
      this.filteredProviders$.next(this.providers);
      return;
    }

    const filtered = this.providers.filter(provider =>
      provider.providerName.toLowerCase().includes(search) ||
      provider.email.toLowerCase().includes(search) ||
      provider.nit.toLowerCase().includes(search)
    );
    this.filteredProviders$.next(filtered);
  }

  filterServices(): void {
    const search = this.serviceFilterCtrl.value?.toLowerCase() || '';
    if (!search) {
      this.filteredServices$.next(this.services);
      return;
    }

    const filtered = this.services.filter(service =>
      service.serviceName.toLowerCase().includes(search) ||
      (service.description && service.description.toLowerCase().includes(search))
    );
    this.filteredServices$.next(filtered);
  }

  filterCountries(search: string): CountryDTO[] {
    if (!search) {
      return this.countries;
    }

    const searchLower = search.toLowerCase();
    return this.countries.filter(country =>
      country.name.toLowerCase().includes(searchLower) ||
      country.code.toLowerCase().includes(searchLower) ||
      country.officialName.toLowerCase().includes(searchLower) ||
      country.region.toLowerCase().includes(searchLower)
    );
  }

  onProviderChange(): void {
    const providerId = this.assignmentForm.get('providerId')?.value;
    this.selectedProvider = this.providers.find(p => p.providerId === providerId) || null;
  }

  onServiceChange(): void {
    const serviceId = this.assignmentForm.get('serviceId')?.value;
    this.selectedService = this.services.find(s => s.serviceId === serviceId) || null;
  }

  isCountrySelected(countryCode: string): boolean {
    return this.selectedCountries.includes(countryCode);
  }

  toggleCountry(countryCode: string): void {
    const index = this.selectedCountries.indexOf(countryCode);
    if (index >= 0) {
      this.selectedCountries.splice(index, 1);
    } else {
      this.selectedCountries.push(countryCode);
    }
    this.assignmentForm.patchValue({ countryCodes: this.selectedCountries });
  }

  removeCountry(countryCode: string): void {
    const index = this.selectedCountries.indexOf(countryCode);
    if (index >= 0) {
      this.selectedCountries.splice(index, 1);
      this.assignmentForm.patchValue({ countryCodes: this.selectedCountries });
    }
  }

  getCountryName(countryCode: string): string {
    const country = this.countries.find(c => c.code === countryCode);
    return country ? country.name : countryCode;
  }

  getCountryFlag(countryCode: string): string {
    const country = this.countries.find(c => c.code === countryCode);
    return country ? country.flagUrl : '';
  }

  assignService(): void {
    if (this.assignmentForm.invalid || this.isSubmitting) {
      this.notificationsService.showToastWarningMessage('Por favor complete todos los campos requeridos');
      return;
    }

    this.isSubmitting = true;
    const formValue = this.assignmentForm.value;

    const assignment: AssignServiceToProviderDTO = {
      providerId: formValue.providerId,
      serviceId: formValue.serviceId,
      countryCodes: JSON.stringify(formValue.countryCodes)
    };

    this.providerServicesUseCase
      .AssignServiceToProvider(assignment)
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this.isSubmitting = false;
          if (result) {
            this.notificationsService.showToastSuccessMessage('Servicio asignado exitosamente al proveedor');
            setTimeout(() => {
              this.goBack();
            }, 1000);
          } else {
            this.notificationsService.showToastErrorMessage('No se pudo completar la asignación');
            this.goBack();
          }
        },
        error: (error) => {
          console.error('Error creating assignment:', error);
          this.isSubmitting = false;
          this.notificationsService.showToastErrorMessage(
            error?.error?.message || 'Error al asignar el servicio al proveedor'
          );
        },
      });
  }

  goBack(): void {
    this.location.back();
  }
}
