import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HttpService } from '../http-services/http.service';
import { ConfigService } from '../config/config.service';
import { IProvidersService } from '../../../core/interfaces/services/IProviders.service';
import { ResponseDTO } from '../../../core/data-transfer-object/common/response/response.dto';
import { AddCustomFieldDTO, CreateProviderDTO, GetProvidersPagedDTO } from '../../../core/data-transfer-object/app/providers.dto';

@Injectable({
  providedIn: 'root',
})
export class ProvidersService implements IProvidersService {
  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService
  ) {}

  GetProvidersPaged(filters?: GetProvidersPagedDTO): Observable<ResponseDTO> {
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

        return this._httpService.get(url, 'Providers/paged', params);
      })
    );
  }

  CreateProvider(provider: CreateProviderDTO): Observable<ResponseDTO> {
    return this._configService.getUrlApplication().pipe(
      switchMap((url) => {
        const body = {
          nit: provider.nit,
          providerName: provider.providerName,
          email: provider.email,
        };
        return this._httpService.post(url, 'Providers', null, body);
      })
    );
  }

  DeleteProvider(providerId: number): Observable<ResponseDTO> {
    return this._configService.getUrlApplication().pipe(
      switchMap((url) => {
        return this._httpService.delete(url, `Providers/${providerId}`);
      })
    );
  }

  AddCustomFieldToProvider(customField: AddCustomFieldDTO): Observable<ResponseDTO> {
    return this._configService.getUrlApplication().pipe(
      switchMap((url) => {
        const body = {
          providerId: customField.providerId,
          fieldName: customField.fieldName,
          fieldValue: customField.fieldValue,
        };
        return this._httpService.post(
          url,
          `Providers/${customField.providerId}/custom-fields`,
          null,
          body
        );
      })
    );
  }
}