import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Provider, CustomField } from '../../../core/models/provider.model';
import { Service } from '../../../core/models/service.model';
import { ProviderMockService } from '../../../infrastructure/services/providers/provider-mock.service';
import { ServiceMockService } from '../../../infrastructure/services/services/service-mock.service';

@Component({
  selector: 'app-provider-form',
  templateUrl: './provider-form.component.html',
  styleUrls: ['./provider-form.component.scss']
})
export class ProviderFormComponent implements OnInit {
  
  providerForm!: FormGroup;
  customFieldForm!: FormGroup;
  providerId: string | null = null;
  isEditMode = false;
  loading = false;
  availableServices: Service[] = [];
  customFieldTypes = ['text', 'number', 'date', 'boolean'];

  constructor(
    private fb: FormBuilder,
    private providerService: ProviderMockService,
    private serviceService: ServiceMockService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForms();
    this.loadServices();
    
    this.providerId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.providerId;

    if (this.isEditMode && this.providerId) {
      this.loadProvider(this.providerId);
    }
  }

  initForms(): void {
    this.providerForm = this.fb.group({
      nit: ['', [Validators.required, Validators.pattern(/^\d{9}-\d{1}$/)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      services: [[]],
      customFields: this.fb.array([])
    });

    this.customFieldForm = this.fb.group({
      key: ['', Validators.required],
      value: ['', Validators.required],
      type: ['text', Validators.required]
    });
  }

  get customFields(): FormArray {
    return this.providerForm.get('customFields') as FormArray;
  }

  loadServices(): void {
    this.serviceService.getServices(1, 100).subscribe({
      next: (result) => {
        this.availableServices = result.data;
      },
      error: (error) => console.error('Error loading services:', error)
    });
  }

  loadProvider(id: string): void {
    this.loading = true;
    this.providerService.getProviderById(id).subscribe({
      next: (provider) => {
        if (provider) {
          this.providerForm.patchValue({
            nit: provider.nit,
            name: provider.name,
            email: provider.email,
            services: provider.services || []
          });

          // Cargar campos personalizados
          if (provider.customFields) {
            provider.customFields.forEach(cf => {
              this.customFields.push(this.createCustomFieldGroup(cf));
            });
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading provider:', error);
        this.loading = false;
      }
    });
  }

  createCustomFieldGroup(customField?: CustomField): FormGroup {
    return this.fb.group({
      id: [customField?.id || ''],
      key: [customField?.key || '', Validators.required],
      value: [customField?.value || '', Validators.required],
      type: [customField?.type || 'text', Validators.required]
    });
  }

  addCustomField(): void {
    if (this.customFieldForm.valid) {
      const newField = this.createCustomFieldGroup(this.customFieldForm.value);
      this.customFields.push(newField);
      this.customFieldForm.reset({ type: 'text' });
    }
  }

  removeCustomField(index: number): void {
    this.customFields.removeAt(index);
  }

  onSubmit(): void {
    if (this.providerForm.valid) {
      this.loading = true;
      const formValue = this.providerForm.value;

      if (this.isEditMode && this.providerId) {
        this.providerService.updateProvider(this.providerId, formValue).subscribe({
          next: () => {
            this.router.navigate(['/providers']);
          },
          error: (error) => {
            console.error('Error updating provider:', error);
            this.loading = false;
          }
        });
      } else {
        this.providerService.createProvider(formValue).subscribe({
          next: () => {
            this.router.navigate(['/providers']);
          },
          error: (error) => {
            console.error('Error creating provider:', error);
            this.loading = false;
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.providerForm);
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
