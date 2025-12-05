import { Injectable } from '@angular/core';
import { Observable, of, switchMap, catchError, throwError } from 'rxjs';
import { IAuthService } from '../../../core/interfaces/auth/Iauth.service';
import { ResponseDTO } from '../../../core/data-transfer-object/common/response/response.dto';
import { HttpService } from '../http-services/http.service';
import { ConfigService } from '../config/config.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements IAuthService {

  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService,
    private _tokenService: TokenService
  ) {}

  login(email: string, password: string): Observable<ResponseDTO> {
    if (!this.validateCredentials(email, password)) {
      return of({
        isSuccess: false,
        message: 'Credenciales inválidas. Verifique su email y contraseña.',
        data: null
      });
    }

    return this._configService.getUrlApplication().pipe(
      switchMap(url => {
        const loginPayload = { 
          email: email.trim().toLowerCase(), 
          password: password 
        };
        return this._httpService.post(url, 'authentication/login', null, loginPayload);
      }),
      catchError(error => {
        console.error('❌ Auth error:', error);
        return throwError(() => this.handleAuthError(error));
      })
    );
  }

  private handleAuthError(error: any): any {
    let customError = { ...error };

    if (error.status === 429) {
      customError.userMessage = error.error?.message || 
        'Demasiados intentos de inicio de sesión. Por favor, intente más tarde.';
      customError.isRateLimited = true;
    } else if (error.status === 400) {
      customError.userMessage = 'Credenciales inválidas. Verifique su email y contraseña.';
    } else if (error.status === 401) {
      customError.userMessage = 'Credenciales inválidas.';
    } else if (error.status === 0) {
      customError.userMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
    } else if (error.status >= 500) {
      customError.userMessage = 'Error del servidor. Por favor, intente más tarde.';
    } else {
      customError.userMessage = 'Error al iniciar sesión. Por favor, intente nuevamente.';
    }

    return customError;
  }

  isLoggedIn(): boolean {
    return this._tokenService.isTokenValid();
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+$/;
    return emailRegex.test(email);
  }

  validateCredentials(email: string, password: string): boolean {
    if (!email || !password) {
      return false;
    }

    if (!this.isValidEmail(email)) {
      return false;
    }

    if (password.length < 8) {
      return false;
    }

    return true;
  }

  getRateLimitInfo(error: any): { retryAfter?: number; retryAfterMinutes?: number } | null {
    if (error.status === 429 && error.error) {
      return {
        retryAfter: error.error.retryAfter,
        retryAfterMinutes: error.error.retryAfterMinutes
      };
    }
    return null;
  }
}
