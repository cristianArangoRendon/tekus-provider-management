import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserData {
  UserId?: number;
  UserName?: string;
  Email?: string;
  Role?: string;
  exp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  
  private currentUserSubject = new BehaviorSubject<UserData | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadUserData();
  }

  public loadUserData(): void {
    const token = this.getToken();
    if (token && this.isTokenValid()) {
      const userData = this.decodeToken(token);
      this.currentUserSubject.next(userData);
    } else {
      this.currentUserSubject.next(null);
    }
  }

  public getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  public setToken(token: string): void {
    localStorage.setItem('authToken', token);
    this.loadUserData();
  }

  public clearToken(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  public isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const payload = this.decodeToken(token);
      if (!payload.exp) {
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  public getCurrentUserData(): UserData | null {
    return this.currentUserSubject.value;
  }

  private decodeToken(token: string): UserData {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return {};
    }
  }

  public getTokenExpiration(): Date | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    const userData = this.decodeToken(token);
    if (!userData.exp) {
      return null;
    }

    return new Date(userData.exp * 1000);
  }
}
