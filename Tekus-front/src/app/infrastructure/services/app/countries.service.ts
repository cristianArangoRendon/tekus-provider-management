import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HttpService } from '../http-services/http.service';
import { ConfigService } from '../config/config.service';
import { ICountriesService } from '../../../core/interfaces/services/ICountries.service';
import { CountryFilterDTO } from '../../../core/data-transfer-object/app/countries.dto';
import { ResponseDTO } from '../../../core/data-transfer-object/common/response/response.dto';

@Injectable({
  providedIn: 'root',
})
export class CountriesService implements ICountriesService {
  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService
  ) {}

  GetCountriesPaged(filters?: CountryFilterDTO): Observable<ResponseDTO> {
    return this._configService.getUrlApplication().pipe(
      switchMap((url) => {
        const params: any = {};

        if (filters?.searchTerm) {
          params.searchTerm = filters.searchTerm;
        }
        if (filters?.region) {
          params.region = filters.region;
        }
        if (filters?.language) {
          params.language = filters.language;
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
        if (filters?.ascending !== undefined) {
          params.ascending = filters.ascending.toString();
        }

        return this._httpService.get(url, 'Countries/paged', params);
      })
    );
  }

  GetAllCountries(): Observable<ResponseDTO> {
    return this._configService.getUrlApplication().pipe(
      switchMap((url) => {
        return this._httpService.get(url, 'Countries/all', null);
      })
    );
  }

  GetCountryByCode(code: string): Observable<ResponseDTO> {
    return this._configService.getUrlApplication().pipe(
      switchMap((url) => {
        return this._httpService.get(url, `Countries/${code}`, null);
      })
    );
  }

  GetCountriesByRegion(region: string): Observable<ResponseDTO> {
    return this._configService.getUrlApplication().pipe(
      switchMap((url) => {
        return this._httpService.get(url, `Countries/region/${region}`, null);
      })
    );
  }

  SearchCountriesByName(name: string): Observable<ResponseDTO> {
    return this._configService.getUrlApplication().pipe(
      switchMap((url) => {
        return this._httpService.get(url, `Countries/search/${name}`, null);
      })
    );
  }

  GetAvailableRegions(): Observable<ResponseDTO> {
    return this._configService.getUrlApplication().pipe(
      switchMap((url) => {
        return this._httpService.get(url, 'Countries/regions', null);
      })
    );
  }
}