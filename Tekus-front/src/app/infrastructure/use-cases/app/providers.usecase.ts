import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProvidersService } from '../../services/app/providers.service';
import { NotificationsService } from '../../services/notifications/notifications.service';
import { AddCustomFieldDTO, CreateProviderDTO, GetProvidersPagedDTO, ProvidersPagedResultDTO } from '../../../core/data-transfer-object/app/providers.dto';
import { ResponseDTO } from '../../../core/data-transfer-object/common/response/response.dto';

@Injectable({
  providedIn: 'root',
})
export class ProvidersUseCase {
  constructor(
    private _providersService: ProvidersService,
    private _notificationService: NotificationsService
  ) {}

  GetProvidersPaged(
    filters?: GetProvidersPagedDTO
  ): Observable<ProvidersPagedResultDTO | null> {
    return this._providersService.GetProvidersPaged(filters).pipe(
      map((response: ResponseDTO) => {
        if (!response.isSuccess) {
          this._notificationService.showToastErrorMessage(response.message!);
          return null;
        }
        return response.data as ProvidersPagedResultDTO;
      })
    );
  }

  CreateProvider(provider: CreateProviderDTO): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this._providersService.CreateProvider(provider).subscribe({
        next: (response: ResponseDTO) => {
          if (response.isSuccess) {
            this._notificationService.showToastSuccessMessage(response.message!);
            observer.next(true);
          } else {
            this._notificationService.showToastErrorMessage(response.message!);
            observer.next(false);
          }
          observer.complete();
        },
        error: (error) => {
          this._notificationService.showToastErrorMessage(
            'Error al crear el proveedor'
          );
          observer.next(false);
          observer.complete();
        },
      });
    });
  }

  DeleteProvider(providerId: number): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this._providersService.DeleteProvider(providerId).subscribe({
        next: (response: ResponseDTO) => {
          if (response.isSuccess) {
            this._notificationService.showToastSuccessMessage(response.message!);
            observer.next(true);
          } else {
            this._notificationService.showToastErrorMessage(response.message!);
            observer.next(false);
          }
          observer.complete();
        },
        error: (error) => {
          this._notificationService.showToastErrorMessage(
            'Error al eliminar el proveedor'
          );
          observer.next(false);
          observer.complete();
        },
      });
    });
  }

  AddCustomFieldToProvider(customField: AddCustomFieldDTO): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this._providersService.AddCustomFieldToProvider(customField).subscribe({
        next: (response: ResponseDTO) => {
          if (response.isSuccess) {
            this._notificationService.showToastSuccessMessage(response.message!);
            observer.next(true);
          } else {
            this._notificationService.showToastErrorMessage(response.message!);
            observer.next(false);
          }
          observer.complete();
        },
        error: (error) => {
          this._notificationService.showToastErrorMessage(
            'Error al agregar campo personalizado'
          );
          observer.next(false);
          observer.complete();
        },
      });
    });
  }

  GetActiveProviders(
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<ProvidersPagedResultDTO | null> {
    const filters: GetProvidersPagedDTO = {
      isActive: true,
      pageNumber,
      pageSize,
      sortBy: 'ProviderName',
      sortOrder: 'ASC',
    };
    return this.GetProvidersPaged(filters);
  }

  SearchProviders(
    searchTerm: string,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<ProvidersPagedResultDTO | null> {
    const filters: GetProvidersPagedDTO = {
      searchTerm,
      pageNumber,
      pageSize,
      sortBy: 'ProviderName',
      sortOrder: 'ASC',
    };
    return this.GetProvidersPaged(filters);
  }

  SearchActiveProviders(
    searchTerm: string,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<ProvidersPagedResultDTO | null> {
    const filters: GetProvidersPagedDTO = {
      searchTerm,
      isActive: true,
      pageNumber,
      pageSize,
      sortBy: 'ProviderName',
      sortOrder: 'ASC',
    };
    return this.GetProvidersPaged(filters);
  }

  GetProvidersByServices(
    ascending: boolean = false,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<ProvidersPagedResultDTO | null> {
    const filters: GetProvidersPagedDTO = {
      pageNumber,
      pageSize,
      sortBy: 'TotalServices',
      sortOrder: ascending ? 'ASC' : 'DESC',
    };
    return this.GetProvidersPaged(filters);
  }
}