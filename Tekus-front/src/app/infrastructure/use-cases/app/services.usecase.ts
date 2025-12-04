import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServicesService } from '../../services/app/services.service';
import { NotificationsService } from '../../services/notifications/notifications.service';
import { CreateServiceDTO, GetServicesPagedDTO, ServicesPagedResultDTO, UpdateServiceDTO } from '../../../core/data-transfer-object/app/services.dto';
import { ResponseDTO } from '../../../core/data-transfer-object/common/response/response.dto';

@Injectable({
  providedIn: 'root',
})
export class ServicesUseCase {
  constructor(
    private _servicesService: ServicesService,
    private _notificationService: NotificationsService
  ) {}

  /**
   * Obtiene servicios con paginación y filtros
   */
  GetServicesPaged(
    filters?: GetServicesPagedDTO
  ): Observable<ServicesPagedResultDTO | null> {
    return this._servicesService.GetServicesPaged(filters).pipe(
      map((response: ResponseDTO) => {
        if (!response.isSuccess) {
          this._notificationService.showToastErrorMessage(response.message!);
          return null;
        }
        return response.data as ServicesPagedResultDTO;
      })
    );
  }


  CreateService(service: CreateServiceDTO): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this._servicesService.CreateService(service).subscribe({
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
            'Error al crear el servicio'
          );
          observer.next(false);
          observer.complete();
        },
      });
    });
  }


  UpdateService(service: UpdateServiceDTO): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this._servicesService.UpdateService(service).subscribe({
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
            'Error al actualizar el servicio'
          );
          observer.next(false);
          observer.complete();
        },
      });
    });
  }


  DeleteService(serviceId: number): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this._servicesService.DeleteService(serviceId).subscribe({
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
            'Error al eliminar el servicio'
          );
          observer.next(false);
          observer.complete();
        },
      });
    });
  }


  GetActiveServices(
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<ServicesPagedResultDTO | null> {
    const filters: GetServicesPagedDTO = {
      isActive: true,
      pageNumber,
      pageSize,
      sortBy: 'ServiceName',
      sortOrder: 'ASC',
    };
    return this.GetServicesPaged(filters);
  }


  SearchServices(
    searchTerm: string,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<ServicesPagedResultDTO | null> {
    const filters: GetServicesPagedDTO = {
      searchTerm,
      pageNumber,
      pageSize,
      sortBy: 'ServiceName',
      sortOrder: 'ASC',
    };
    return this.GetServicesPaged(filters);
  }


  SearchActiveServices(
    searchTerm: string,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<ServicesPagedResultDTO | null> {
    const filters: GetServicesPagedDTO = {
      searchTerm,
      isActive: true,
      pageNumber,
      pageSize,
      sortBy: 'ServiceName',
      sortOrder: 'ASC',
    };
    return this.GetServicesPaged(filters);
  }


  GetServicesByRate(
    ascending: boolean = true,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<ServicesPagedResultDTO | null> {
    const filters: GetServicesPagedDTO = {
      pageNumber,
      pageSize,
      sortBy: 'HourlyRateUSD',
      sortOrder: ascending ? 'ASC' : 'DESC',
    };
    return this.GetServicesPaged(filters);
  }
}