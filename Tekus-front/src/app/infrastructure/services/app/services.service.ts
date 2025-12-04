import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HttpService } from '../http-services/http.service';
import { ConfigService } from '../config/config.service';
import { IServicesService } from '../../../core/interfaces/services/IServices.service';
import { CreateServiceDTO, GetServicesPagedDTO, UpdateServiceDTO } from '../../../core/data-transfer-object/app/services.dto';
import { ResponseDTO } from '../../../core/data-transfer-object/common/response/response.dto';

@Injectable({
  providedIn: 'root',
})
export class ServicesService implements IServicesService {
  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService
  ) {}

  GetServicesPaged(filters?: GetServicesPagedDTO): Observable<ResponseDTO> {
    return this._configService.getUrlApplication().pipe(
      switchMap((url) => {
        const params: any = {};

        if (filters?.searchTerm) {
          params.searchTerm = filters.searchTerm;
        }
        if (filters?.isActive !== undefined) {
          params.isActive = filters.isActive.toString();
        }
        if (filters?.pageNumber !== undefined) {
          params.pageNumber = filters.pageNumber.toString();
        }
        if (filters?.pageSize !== undefined) {
          params.pageSize = filters.pageSize.toString();
        }
        if (filters?.sortBy) {
          params.sortBy = filters.sortBy;
        }
        if (filters?.sortOrder) {
          params.sortOrder = filters.sortOrder;
        }

        return this._httpService.get(url, 'Services/paged', params);
      })
    );
  }

  CreateService(service: CreateServiceDTO): Observable<ResponseDTO> {
    return this._configService.getUrlApplication().pipe(
      switchMap((url) => {
        const body = {
          serviceName: service.serviceName,
          hourlyRateUSD: service.hourlyRateUSD,
          description: service.description,
        };
        return this._httpService.post(url, 'Services', null, body);
      })
    );
  }

  UpdateService(service: UpdateServiceDTO): Observable<ResponseDTO> {
    return this._configService.getUrlApplication().pipe(
      switchMap((url) => {
        const body = {
          serviceId: service.serviceId,
          serviceName: service.serviceName,
          hourlyRateUSD: service.hourlyRateUSD,
          description: service.description,
        };
        return this._httpService.put(
          url,
          `Services/${service.serviceId}`,
          null,
          body
        );
      })
    );
  }

  DeleteService(serviceId: number): Observable<ResponseDTO> {
    return this._configService.getUrlApplication().pipe(
      switchMap((url) => {
        return this._httpService.delete(url, `Services/${serviceId}`);
      })
    );
  }
}