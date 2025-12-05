import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginFormService } from './services/login-form.service';

describe('LoginFormService', () => {
  let service: LoginFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [LoginFormService]
    });
    service = TestBed.inject(LoginFormService);
  });

  it('debe crearse el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe inicializar el formulario con controles vacíos', () => {
    expect(service.form).toBeDefined();
    expect(service.form.get('email')?.value).toBe('');
    expect(service.form.get('password')?.value).toBe('');
    expect(service.formSubmitted).toBeFalse();
  });

  describe('Validación de Email (getEmailErrorMessage)', () => {
    it('debe retornar error si el email es requerido', () => {
      const control = service.form.get('email');
      control?.setValue('');
      control?.markAsTouched();

      expect(service.getEmailErrorMessage()).toBe('El correo electrónico es requerido');
    });

    it('debe retornar error si el email tiene formato inválido', () => {
      const control = service.form.get('email');
      control?.setValue('correo-invalido'); 
      control?.markAsTouched();

      expect(service.getEmailErrorMessage()).toBe('Ingrese un correo electrónico válido');
    });

    it('debe retornar cadena vacía si el email es válido', () => {
      const control = service.form.get('email');
      control?.setValue('test@tekus.co');
      
      expect(service.getEmailErrorMessage()).toBe('');
    });
  });

  describe('Validación de Contraseña (getPasswordErrorMessage)', () => {
    it('debe retornar error si la contraseña es requerida', () => {
      const control = service.form.get('password');
      control?.setValue('');
      control?.markAsTouched();

      expect(service.getPasswordErrorMessage()).toBe('La contraseña es requerida');
    });

    it('debe retornar error si la contraseña es muy corta', () => {
      const control = service.form.get('password');
      control?.setValue('123'); 
      control?.markAsTouched();

      expect(service.getPasswordErrorMessage()).toContain('La contraseña debe tener al menos 8 caracteres');
    });

    it('debe retornar cadena vacía si la contraseña es válida', () => {
      const control = service.form.get('password');
      control?.setValue('12345678'); 
      expect(service.getPasswordErrorMessage()).toBe('');
    });
  });

  describe('Método validate()', () => {
    it('debe marcar formSubmitted como true', () => {
      service.validate();
      expect(service.formSubmitted).toBeTrue();
    });

    it('debe retornar lista de errores si el formulario es inválido', () => {
      const errors = service.validate();
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.field === 'email')).toBeTrue();
      expect(errors.some(e => e.field === 'password')).toBeTrue();
    });

    it('debe retornar lista vacía si el formulario es válido', () => {
      service.form.setValue({
        email: 'test@tekus.co',
        password: 'password123'
      });

      const errors = service.validate();
      expect(errors.length).toBe(0);
    });
  });

  describe('Método reset()', () => {
    it('debe limpiar el formulario y el estado formSubmitted', () => {
      service.form.setValue({ email: 'a', password: 'b' });
      service.formSubmitted = true;
      service.form.markAsDirty();

      service.reset();

      expect(service.form.value).toEqual({ email: null, password: null });
      expect(service.formSubmitted).toBeFalse();
      expect(service.form.dirty).toBeFalse();
      expect(service.form.touched).toBeFalse();
    });
  });

  describe('Método hasErrors()', () => {
    it('debe retornar true si el formulario es inválido', () => {
      service.form.get('email')?.setValue('');
      expect(service.hasErrors()).toBeTrue();
    });

    it('debe retornar false si el formulario es válido', () => {
      service.form.setValue({
        email: 'valido@test.com',
        password: 'passwordSeguro'
      });
      expect(service.hasErrors()).toBeFalse();
    });
  });
});