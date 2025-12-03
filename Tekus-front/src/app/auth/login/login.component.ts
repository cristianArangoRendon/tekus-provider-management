import { Component, OnInit, OnDestroy, AfterViewInit, HostListener, signal, computed, effect, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthUseCase } from '../../infrastructure/use-cases/auth/auth.use-case';
import { TokenService } from '../../infrastructure/services/auth/token.service';
import { LoginStateService } from './services/login-state.service';
import { LoginFormService } from './services/login-form.service';
import { NotificationsService } from '../../infrastructure/services/notifications/notifications.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [LoginFormService, LoginStateService]
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  
  private readonly router = inject(Router);
  private readonly authUseCase = inject(AuthUseCase);
  private readonly notificationService = inject(NotificationsService);
  private readonly tokenService = inject(TokenService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly loginState = inject(LoginStateService);
  readonly loginForm = inject(LoginFormService);

  readonly hidePassword = signal<boolean>(true);
  private readonly viewportWidth = signal<number>(window.innerWidth);
  
  readonly isMobile = computed(() => this.viewportWidth() <= 768);
  readonly isLoading = computed(() => this.loginState.isLoading());
  
  private readonly destroy$ = new Subject<void>();
  readonly currentYear = new Date().getFullYear();

  constructor() {
    effect(() => {
      if (this.isMobile()) {
        this.adjustViewportForMobile();
      }
    });

    effect(() => {
      if (this.loginForm.form.valid && this.loginState.hasErrors()) {
        this.loginState.reset();
      }
    });
  }

  ngOnInit(): void {
    this.checkExistingSession();
    this.initializeViewport();
  }

  ngAfterViewInit(): void {
    this.loginForm.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateInputClasses();
      });

    this.detectAutofill();
  }

  private updateInputClasses(): void {
    setTimeout(() => {
      const emailInput = document.getElementById('email-input') as HTMLInputElement;
      const passwordInput = document.getElementById('password-input') as HTMLInputElement;
      
      const emailValue = this.loginForm.form.get('email')?.value;
      const passwordValue = this.loginForm.form.get('password')?.value;
      
      if (emailInput) {
        if (emailValue && emailValue.trim() !== '') {
          emailInput.classList.add('has-value');
        } else {
          emailInput.classList.remove('has-value');
        }
      }
      
      if (passwordInput) {
        if (passwordValue && passwordValue.trim() !== '') {
          passwordInput.classList.add('has-value');
        } else {
          passwordInput.classList.remove('has-value');
        }
      }
    }, 0);
  }

  private detectAutofill(): void {
    const checkTimes = [100, 300, 500, 1000];
    
    checkTimes.forEach(delay => {
      setTimeout(() => {
        this.updateInputClasses();
        this.cdr.detectChanges();
      }, delay);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.viewportWidth.set(window.innerWidth);
  }

  private initializeViewport(): void {
    this.viewportWidth.set(window.innerWidth);
  }

  private adjustViewportForMobile(): void {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      );
    }
  }

  private checkExistingSession(): void {
    if (this.tokenService.isTokenValid()) {
      const userData = this.tokenService.getCurrentUserData();
      if (userData?.UserName) {
        this.notificationService.showToastSuccessMessage(
          `Sesión activa como ${userData.UserName}`
        );
        this.navigateToDashboard();
      }
    }
  }

  get canSubmit(): boolean {
    const formValid = this.loginForm.form.valid;
    const notLoading = !this.isLoading();
    
    return formValid && notLoading;
  }

  shouldShowEmailError(): boolean {
    const emailControl = this.loginForm.form.get('email');
    if (!emailControl) return false;
    
    const hasValue = emailControl.value && emailControl.value.trim() !== '';
    const isTouched = emailControl.touched;
    const isDirty = emailControl.dirty;
    const isInvalid = emailControl.invalid;
    
    return isInvalid && isTouched && isDirty && hasValue;
  }

  shouldShowPasswordError(): boolean {
    const passwordControl = this.loginForm.form.get('password');
    if (!passwordControl) return false;
    
    const hasValue = passwordControl.value && passwordControl.value.trim() !== '';
    const isTouched = passwordControl.touched;
    const isDirty = passwordControl.dirty;
    const isInvalid = passwordControl.invalid;
    
    return isInvalid && isTouched && isDirty && hasValue;
  }

  shouldShowPasswordHint(): boolean {
    const passwordControl = this.loginForm.form.get('password');
    if (!passwordControl) return false;
    
    const isTouched = passwordControl.touched;
    const isDirty = passwordControl.dirty;
    const hasValue = passwordControl.value && passwordControl.value.trim() !== '';
    
    return isTouched && isDirty && !hasValue;
  }

  onSubmit(): void {
    if (this.isLoading()) {
      return;
    }

    this.loginForm.form.markAllAsTouched();
    
    const emailValue = this.loginForm.form.get('email')?.value?.trim() || '';
    const passwordValue = this.loginForm.form.get('password')?.value?.trim() || '';
    
    console.log('Submit - Email:', emailValue);
    console.log('Submit - Password length:', passwordValue.length);
    
    if (!emailValue) {
      this.notificationService.showToastErrorMessage('Por favor ingrese su correo electrónico');
      return;
    }
    
    if (!passwordValue) {
      this.notificationService.showToastErrorMessage('Por favor ingrese su contraseña');
      return;
    }
    
    if (!this.loginForm.form.valid) {
      const errors = this.loginForm.validate();
      if (errors.length > 0) {
        this.notificationService.showToastErrorMessage(errors[0].message);
      }
      return;
    }

    this.performLogin(emailValue, passwordValue);
  }

  private performLogin(email: string, password: string): void {
    console.log('Performing login with:', { email, passwordLength: password.length });
    
    this.loginState.startLogin();
    
    this.authUseCase.login(email, password)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => this.handleLoginSuccess(response),
        error: (error) => this.handleLoginError(error)
      });
  }

  private handleLoginSuccess(response: any): void {
    if (!response) {
      this.handleLoginFailure('Respuesta inválida del servidor');
      return;
    }

    setTimeout(() => {
      const token = localStorage.getItem('authToken');
      if (token) {
        this.loginState.loginSuccess();
        this.navigateToDashboard();
      } else {
        this.handleLoginFailure('Token no encontrado');
      }
    }, 500);
  }

  private handleLoginFailure(reason: string): void {
    console.error('Login failure:', reason);
    this.loginState.loginError(reason);
    this.notificationService.showToastErrorMessage(`Error: ${reason}`);
  }

  private handleLoginError(error: any): void {
    console.error('Login error:', error);

    switch (error.status) {
      case 401:
      case 400:
        this.handleAuthenticationError(error);
        break;
      case 0:
        this.handleNetworkError();
        break;
      default:
        if (error.status >= 500) {
          this.handleServerError();
        } else {
          this.handleGenericError(error);
        }
    }
  }

  private handleAuthenticationError(error: any): void {
    const message = error.userMessage || 
      'Credenciales inválidas. Verifique su email y contraseña.';
    
    this.loginState.loginError(message);
    this.notificationService.showToastErrorMessage(message);
  }

  private handleNetworkError(): void {
    const message = 'No se pudo conectar con el servidor. Verifique su conexión.';
    this.loginState.loginError(message);
    this.notificationService.showToastErrorMessage(message);
  }

  private handleServerError(): void {
    const message = 'Error del servidor. Por favor, intente más tarde.';
    this.loginState.loginError(message);
    this.notificationService.showToastErrorMessage(message);
  }

  private handleGenericError(error: any): void {
    const message = error.userMessage || 
      'Error al iniciar sesión. Por favor, intente nuevamente.';
    
    this.loginState.loginError(message);
    this.notificationService.showToastErrorMessage(message);
  }

  private navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  togglePasswordVisibility(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.hidePassword.update(value => !value);
  }

  logout(): void {
    this.tokenService.clearToken();
    this.notificationService.showToastSuccessMessage('Sesión cerrada');
    
    this.loginForm.reset();
    this.loginState.clear();
  }

  get loginFormGroup() {
    return this.loginForm.form;
  }

  get hide() {
    return this.hidePassword;
  }

  get submitted() {
    return this.loginForm.formSubmitted;
  }

  getEmailErrorMessage(): string {
    return this.loginForm.getEmailErrorMessage();
  }

  getPasswordErrorMessage(): string {
    return this.loginForm.getPasswordErrorMessage();
  }
}
