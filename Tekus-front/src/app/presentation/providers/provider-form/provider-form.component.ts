import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ServicePagedDTO } from '../../../core/data-transfer-object/app/services.dto';
import {
  AddCustomFieldDTO,
  CreateProviderDTO,
} from '../../../core/data-transfer-object/app/providers.dto';
import { ProvidersUseCase } from '../../../infrastructure/use-cases/app/providers.usecase';
import { ServicesUseCase } from '../../../infrastructure/use-cases/app/services.usecase';

interface CustomFieldForm {
  fieldName: string;
  fieldValue: string;
}

@Component({
  selector: 'app-provider-form',
  templateUrl: './provider-form.component.html',
  styleUrls: ['./provider-form.component.scss'],
})
export class ProviderFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  providerForm!: FormGroup;
  customFieldForm!: FormGroup;
  providerId: number | null = null;
  isEditMode = false;
  loading = false;
  availableServices: ServicePagedDTO[] = [];
  customFieldsList: CustomFieldForm[] = [];

  constructor(
    private fb: FormBuilder,
    private providerUseCase: ProvidersUseCase,
    private servicesUseCase: ServicesUseCase,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadServices();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.providerId = parseInt(id, 10);
      this.isEditMode = true;
      this.loadProvider(this.providerId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForms(): void {
    this.providerForm = this.fb.group({
      nit: ['', [Validators.required, Validators.pattern(/^\d{9}-\d{1}$/)]],
      providerName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
    });

    this.customFieldForm = this.fb.group({
      fieldName: ['', Validators.required],
      fieldValue: ['', Validators.required],
    });
  }

  loadServices(): void {
    this.loading = true;
    this.servicesUseCase
      .GetActiveServices(1, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result) {
            this.availableServices = result.results;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading services:', error);
          this.loading = false;
        },
      });
  }

  loadProvider(id: number): void {
    this.loading = true;
    this.providerUseCase
      .GetProvidersPaged({ pageNumber: 1, pageSize: 1000 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result) {
            const provider = result.results.find((p) => p.providerId === id);
            if (provider) {
              this.providerForm.patchValue({
                nit: provider.nit,
                providerName: provider.providerName,
                email: provider.email,
              });

              if (provider.customFields) {
                this.customFieldsList = this.parseCustomFields(
                  provider.customFields
                );
              }
            }
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading provider:', error);
          this.loading = false;
        },
      });
  }

  parseCustomFields(customFieldsJson: string): CustomFieldForm[] {
    try {
      const parsed = JSON.parse(customFieldsJson || '{}');
      return Object.entries(parsed).map(([key, value]) => ({
        fieldName: key,
        fieldValue: value as string,
      }));
    } catch {
      return [];
    }
  }

  addCustomField(): void {
    if (this.customFieldForm.valid) {
      const newField: CustomFieldForm = {
        fieldName: this.customFieldForm.value.fieldName,
        fieldValue: this.customFieldForm.value.fieldValue,
      };

      this.customFieldsList.push(newField);
      this.customFieldForm.reset();
    }
  }

  removeCustomField(index: number): void {
    this.customFieldsList.splice(index, 1);
  }

  onSubmit(): void {
    if (this.providerForm.valid) {
      this.loading = true;

      if (this.isEditMode && this.providerId) {
        console.warn('Update provider functionality not implemented in backend');
        this.loading = false;
        this.router.navigate(['/providers']);
      } else {
        this.createProvider();
      }
    } else {
      this.markFormGroupTouched(this.providerForm);
    }
  }

  createProvider(): void {
    const createDTO: CreateProviderDTO = {
      nit: this.providerForm.value.nit,
      providerName: this.providerForm.value.providerName,
      email: this.providerForm.value.email,
    };

    this.providerUseCase
      .CreateProvider(createDTO)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (success) => {
          if (success) {
            if (this.customFieldsList.length > 0) {
              console.warn(
                'Custom fields need providerId from creation response. This requires backend modification.'
              );
            }
            this.router.navigate(['/providers']);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating provider:', error);
          this.loading = false;
        },
      });
  }

  addCustomFieldsToProvider(providerId: number): void {
    if (this.customFieldsList.length === 0) {
      this.router.navigate(['/providers']);
      return;
    }

    let completedRequests = 0;
    const totalRequests = this.customFieldsList.length;

    this.customFieldsList.forEach((customField) => {
      const addCustomFieldDTO: AddCustomFieldDTO = {
        providerId: providerId,
        fieldName: customField.fieldName,
        fieldValue: customField.fieldValue,
      };

      this.providerUseCase
        .AddCustomFieldToProvider(addCustomFieldDTO)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            completedRequests++;
            if (completedRequests === totalRequests) {
              this.loading = false;
              this.router.navigate(['/providers']);
            }
          },
          error: (error) => {
            console.error('Error adding custom field:', error);
            completedRequests++;
            if (completedRequests === totalRequests) {
              this.loading = false;
              this.router.navigate(['/providers']);
            }
          },
        });
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
    this.router.navigate(['/providers']);
  }

  getErrorMessage(controlName: string): string {
    const control = this.providerForm.get(controlName);

    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('email')) {
      return 'Email inválido';
    }
    if (control?.hasError('pattern')) {
      return 'Formato de NIT inválido (ej: 900123456-1)';
    }
    if (control?.hasError('minlength')) {
      return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    }

    return '';
  }
}