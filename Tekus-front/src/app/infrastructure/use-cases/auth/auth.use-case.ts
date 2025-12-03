import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';
import { ResponseDTO } from '../../../core/data-transfer-object/common/response/response.dto';
import { TokenService } from '../../services/auth/token.service';
import { NotificationsService } from '../../services/notifications/notifications.service';

@Injectable({
  providedIn: 'root',
})
export class AuthUseCase {

  constructor(
    private _auth: AuthService,
    private _notificationService: NotificationsService,
    private _tokenService: TokenService
  ) {}

  login(email: string, password: string): Observable<boolean> {
    return this._auth.login(email, password).pipe(
      switchMap((response: ResponseDTO) => {
        if (response.isSuccess) {
          return this.handleSuccessfulLogin(response);
        } else {
          return this.handleFailedLogin(response);
        }
      }),
      catchError(error => {
        console.error('❌ AuthUseCase: Error capturado:', error);
        return this.handleLoginError(error);
      })
    );
  }

  private handleSuccessfulLogin(response: ResponseDTO): Observable<boolean> {
    try {
      const data = response.data;
      let authToken: string;
      
      if (typeof data === 'string') {
        authToken = data;
      } else if (data?.token) {
        authToken = data.token;
      } else {
        console.error('❌ Formato de token inválido:', data);
        this._notificationService.showToastErrorMessage('Token no válido');
        return of(false);
      }
      
      localStorage.setItem('authToken', authToken);
      
      if (data?.expiresIn) {
        const expirationTime = new Date(Date.now() + (data.expiresIn * 1000));
        localStorage.setItem('tokenExpiration', expirationTime.toISOString());
      }

      setTimeout(() => {
        this._tokenService.loadUserData();
      }, 100);
      
      return of(true);
    } catch (error) {
      console.error('❌ Error procesando login exitoso:', error);
      this._notificationService.showToastErrorMessage('Error procesando la respuesta del servidor');
      return of(false);
    }
  }

  private handleFailedLogin(response: ResponseDTO): Observable<boolean> {
    const message = response.message || 'Error en el login';
    this._notificationService.showToastErrorMessage(message);
    return of(false);
  }

  private handleLoginError(error: any): Observable<boolean> {
    console.error('❌ Error en login:', error);
    
    let errorMessage = 'Error al iniciar sesión';
    
    if (error.userMessage) {
      errorMessage = error.userMessage;
    } else if (error.status === 429) {
      errorMessage = error.error?.message || 
        'Demasiados intentos. Por favor, espere antes de intentar nuevamente.';
    } else if (error.status === 0) {
      errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión.';
    } else if (error.status >= 500) {
      errorMessage = 'Error del servidor. Intente más tarde.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    this._notificationService.showToastErrorMessage(errorMessage);
    return of(false);
  }

  logout(): Observable<boolean> {
    this._tokenService.clearToken();
    this._notificationService.showToastSuccessMessage('Sesión cerrada correctamente');
    return of(true);
  }

  isLoggedIn(): boolean {
    return this._tokenService.isTokenValid();
  }
}
