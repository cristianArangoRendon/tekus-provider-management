import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { IHttpService } from '../../../core/interfaces/http-services/Ihttp.service';
import { ResponseDTO } from '../../../core/data-transfer-object/common/response/response.dto';

@Injectable({
  providedIn: 'root',
})
export class HttpService implements IHttpService {

  constructor(
    private httpClient: HttpClient,
    private router: Router
  ) {
    this.initialize();
  }

  private initialize(): void {
  }

  private addJwtTokenHeader(): HttpHeaders {
    const token = localStorage.getItem('authToken');

    if (!token) {
      return new HttpHeaders();
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('Error en la petición HTTP:', error);
    
    if (error.status === 401) {
      localStorage.removeItem('authToken');
      this.router.navigate(['/login']);
    }
    
    return throwError(() => error);
  }

  private buildUrl(urlService: string, endpoint: string, params?: any): string {
    let url = `${urlService}/${endpoint}`;
    
    if (params && typeof params === 'object') {
      const queryParams = new HttpParams({ fromObject: params });
      url += `?${queryParams.toString()}`;
    }
    
    return url;
  }

  private performHttpRequest<T>(
    urlService: string,
    method: 'get' | 'post' | 'put' | 'delete',
    endpoint: string,
    params?: any,
    body?: any
  ): Observable<T> {
    return new Observable<T>((observer) => {
      const url = this.buildUrl(urlService, endpoint, params);
      let httpCall: Observable<T>;

      switch (method) {
        case 'get':
          httpCall = this.httpClient.get<T>(url, { headers: this.addJwtTokenHeader() });
          break;
        case 'post':
          httpCall = this.httpClient.post<T>(url, body, { headers: this.addJwtTokenHeader() });
          break;
        case 'put':
          httpCall = this.httpClient.put<T>(url, body, { headers: this.addJwtTokenHeader() });
          break;
        case 'delete':
          httpCall = this.httpClient.delete<T>(url, { headers: this.addJwtTokenHeader() });
          break;
      }

      httpCall.pipe(
        catchError(this.handleError.bind(this))
      ).subscribe({
        next: (response) => observer.next(response),
        error: (err) => observer.error(err),
        complete: () => observer.complete()
      });
    });
  }

  get(urlService: string, endpoint: string, params?: any): Observable<ResponseDTO> {
    return this.performHttpRequest<ResponseDTO>(urlService, 'get', endpoint, params);
  }

  post(urlService: string, endpoint: string, params?: any, body?: any): Observable<ResponseDTO> {
    return this.performHttpRequest<ResponseDTO>(urlService, 'post', endpoint, params, body);
  }

  put(urlService: string, endpoint: string, params?: any, body?: any): Observable<ResponseDTO> {
    return this.performHttpRequest<ResponseDTO>(urlService, 'put', endpoint, params, body);
  }

  delete(urlService: string, endpoint: string, params?: any): Observable<ResponseDTO> {
    return this.performHttpRequest<ResponseDTO>(urlService, 'delete', endpoint, params);
  }
}
