import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface ValidationError {
  field: string;
  message: string;
}

@Injectable()
export class LoginFormService {
  readonly form: FormGroup;
  formSubmitted = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^\s@]+@[^\s@]+$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8)
      ]]
    });
  }

  validate(): ValidationError[] {
    const errors: ValidationError[] = [];
    this.formSubmitted = true;

    if (this.form.get('email')?.hasError('required')) {
      errors.push({
        field: 'email',
        message: 'El correo electrónico es requerido'
      });
    } else if (this.form.get('email')?.hasError('email') || 
               this.form.get('email')?.hasError('pattern')) {
      errors.push({
        field: 'email',
        message: 'Ingrese un correo electrónico válido'
      });
    }

    if (this.form.get('password')?.hasError('required')) {
      errors.push({
        field: 'password',
        message: 'La contraseña es requerida'
      });
    } else if (this.form.get('password')?.hasError('minlength')) {
      errors.push({
        field: 'password',
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
    }

    return errors;
  }

  getEmailErrorMessage(): string {
    const emailControl = this.form.get('email');
    
    if (!emailControl || !emailControl.errors) {
      return '';
    }

    if (emailControl.hasError('required')) {
      return 'El correo electrónico es requerido';
    }

    if (emailControl.hasError('email') || emailControl.hasError('pattern')) {
      return 'Ingrese un correo electrónico válido';
    }

    return '';
  }

  getPasswordErrorMessage(): string {
    const passwordControl = this.form.get('password');
    
    if (!passwordControl || !passwordControl.errors) {
      return '';
    }

    if (passwordControl.hasError('required')) {
      return 'La contraseña es requerida';
    }

    if (passwordControl.hasError('minlength')) {
      const minLength = passwordControl.errors['minlength'].requiredLength;
      return `La contraseña debe tener al menos ${minLength} caracteres`;
    }

    return '';
  }

  reset(): void {
    this.form.reset();
    this.formSubmitted = false;
    
    // Limpiar los estados de touched y dirty
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.setErrors(null);
      this.form.get(key)?.markAsUntouched();
      this.form.get(key)?.markAsPristine();
    });
  }

  hasErrors(): boolean {
    return this.form.invalid;
  }
}
