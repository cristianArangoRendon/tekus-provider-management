import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private apiUrl: string = 'https://localhost:5001/api'; 

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {

    const configUrl = localStorage.getItem('apiUrl');
    if (configUrl) {
      this.apiUrl = configUrl;
    }
  }

  getUrlApplication(): Observable<string> {
    return of(this.apiUrl);
  }

  setUrlApplication(url: string): void {
    this.apiUrl = url;
    localStorage.setItem('apiUrl', url);
  }

  getApiUrl(): string {
    return this.apiUrl;
  }
}
