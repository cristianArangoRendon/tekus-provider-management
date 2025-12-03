import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Service, Country } from '../../../core/models/service.model';
import { ServiceMockService } from '../../../infrastructure/services/services/service-mock.service';
import { CountryMockService } from '../../../infrastructure/services/countries/country-mock.service';

@Component({
  selector: 'app-service-form',
  templateUrl: './service-form.component.html',
  styleUrls: ['./service-form.component.scss']
})
export class ServiceFormComponent implements OnInit {
  
  serviceForm!: FormGroup;
  serviceId: string | null = null;
  isEditMode = false;
  loading = false;
  availableCountries: Country[] = [];

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceMockService,
    private countryService: CountryMockService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadCountries();
    
    this.serviceId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.serviceId;

    if (this.isEditMode && this.serviceId) {
      this.loadService(this.serviceId);
    }
  }

  initForm(): void {
    this.serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      hourlyRate: ['', [Validators.required, Validators.min(0)]],
      countries: [[], [Validators.required, Validators.minLength(1)]]
    });
  }

  loadCountries(): void {
    this.loading = true;
    this.countryService.getCountries().subscribe({
      next: (countries) => {
        this.availableCountries = countries;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading countries:', error);
        this.loading = false;
      }
    });
  }

  loadService(id: string): void {
    this.loading = true;
    this.serviceService.getServiceById(id).subscribe({
      next: (service) => {
        if (service) {
          this.serviceForm.patchValue({
            name: service.name,
            hourlyRate: service.hourlyRate,
            countries: service.countries || []
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading service:', error);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.serviceForm.valid) {
      this.loading = true;
      const formValue = this.serviceForm.value;

      if (this.isEditMode && this.serviceId) {
        this.serviceService.updateService(this.serviceId, formValue).subscribe({
          next: () => {
            this.router.navigate(['/services']);
          },
          error: (error) => {
            console.error('Error updating service:', error);
            this.loading = false;
          }
        });
      } else {
        this.serviceService.createService(formValue).subscribe({
          next: () => {
            this.router.navigate(['/services']);
          },
          error: (error) => {
            console.error('Error creating service:', error);
            this.loading = false;
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.serviceForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
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

  compareCountries(c1: Country, c2: Country): boolean {
    return c1 && c2 ? c1.code === c2.code : c1 === c2;
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
      const minLength = control.errors?.['minlength'];
      if (minLength?.actualLength === 0) {
        return 'Debe seleccionar al menos un país';
      }
      return `Mínimo ${minLength.requiredLength} caracteres`;
    }
    
    return '';
  }
}
