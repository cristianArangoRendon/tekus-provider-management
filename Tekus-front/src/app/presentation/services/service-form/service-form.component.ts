import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  CreateServiceDTO,
  UpdateServiceDTO,
} from '../../../core/data-transfer-object/app/services.dto';
import { CountryDTO } from '../../../core/data-transfer-object/app/countries.dto';
import { ServicesUseCase } from '../../../infrastructure/use-cases/app/services.usecase';
import { CountriesUseCase } from '../../../infrastructure/use-cases/app/countries.usecase';

@Component({
  selector: 'app-service-form',
  templateUrl: './service-form.component.html',
  styleUrls: ['./service-form.component.scss'],
})
export class ServiceFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  serviceForm!: FormGroup;
  serviceId: number | null = null;
  isEditMode = false;
  loading = false;
  availableCountries: CountryDTO[] = [];
  selectedCountries: CountryDTO[] = [];

  constructor(
    private fb: FormBuilder,
    private servicesUseCase: ServicesUseCase,
    private countriesUseCase: CountriesUseCase,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCountries();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.serviceId = parseInt(id, 10);
      this.isEditMode = true;
      this.loadService(this.serviceId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.serviceForm = this.fb.group({
      serviceName: ['', [Validators.required, Validators.minLength(3)]],
      hourlyRateUSD: ['', [Validators.required, Validators.min(0)]],
      description: ['', [Validators.maxLength(500)]],
    });
  }

  loadCountries(): void {
    this.loading = true;
    this.countriesUseCase
      .GetAllCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (countries) => {
          if (countries) {
            this.availableCountries = countries;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading countries:', error);
          this.loading = false;
        },
      });
  }

  loadService(id: number): void {
    this.loading = true;
    this.servicesUseCase
      .GetServicesPaged({ pageNumber: 1, pageSize: 1000 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result) {
            const service = result.results.find((s) => s.serviceId === id);
            if (service) {
              this.serviceForm.patchValue({
                serviceName: service.serviceName,
                hourlyRateUSD: service.hourlyRateUSD,
                description: service.description || '',
              });
            }
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading service:', error);
          this.loading = false;
        },
      });
  }

  onSubmit(): void {
    if (this.serviceForm.valid) {
      this.loading = true;

      if (this.isEditMode && this.serviceId) {
        this.updateService();
      } else {
        this.createService();
      }
    } else {
      this.markFormGroupTouched(this.serviceForm);
    }
  }

  createService(): void {
    const createDTO: CreateServiceDTO = {
      serviceName: this.serviceForm.value.serviceName,
      hourlyRateUSD: parseFloat(this.serviceForm.value.hourlyRateUSD),
      description: this.serviceForm.value.description || undefined,
    };

    this.servicesUseCase
      .CreateService(createDTO)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (success) => {
          if (success) {
            this.router.navigate(['/services']);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating service:', error);
          this.loading = false;
        },
      });
  }

  updateService(): void {
    if (!this.serviceId) return;

    const updateDTO: UpdateServiceDTO = {
      serviceId: this.serviceId,
      serviceName: this.serviceForm.value.serviceName,
      hourlyRateUSD: parseFloat(this.serviceForm.value.hourlyRateUSD),
      description: this.serviceForm.value.description || undefined,
    };

    this.servicesUseCase
      .UpdateService(updateDTO)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (success) => {
          if (success) {
            this.router.navigate(['/services']);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating service:', error);
          this.loading = false;
        },
      });
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/services']);
  }

  getErrorMessage(controlName: string): string {
    const control = this.serviceForm.get(controlName);

    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('min')) {
      return 'El valor debe ser mayor o igual a 0';
    }
    if (control?.hasError('minlength')) {
      return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (control?.hasError('maxlength')) {
      return `Máximo ${control.errors?.['maxlength'].requiredLength} caracteres`;
    }

    return '';
  }
}