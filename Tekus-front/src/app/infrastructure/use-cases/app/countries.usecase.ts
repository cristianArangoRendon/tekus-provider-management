import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CountriesService } from '../../services/app/countries.service';
import { NotificationsService } from '../../services/notifications/notifications.service';
import { CountryDTO, CountryFilterDTO, PagedResultDTO } from '../../../core/data-transfer-object/app/countries.dto';
import { ResponseDTO } from '../../../core/data-transfer-object/common/response/response.dto';

@Injectable({
  providedIn: 'root',
})
export class CountriesUseCase {
  constructor(
    private _countriesService: CountriesService,
    private _notificationService: NotificationsService
  ) {}


  GetCountriesPaged(
    filters?: CountryFilterDTO
  ): Observable<PagedResultDTO<CountryDTO> | null> {
    return this._countriesService.GetCountriesPaged(filters).pipe(
      map((response: ResponseDTO) => {
        if (!response.isSuccess) {
          this._notificationService.showToastErrorMessage(response.message!);
          return null;
        }
        return response.data as PagedResultDTO<CountryDTO>;
      })
    );
  }

 
  GetAllCountries(): Observable<CountryDTO[] | null> {
    return this._countriesService.GetAllCountries().pipe(
      map((response: ResponseDTO) => {
        if (!response.isSuccess) {
          this._notificationService.showToastErrorMessage(response.message!);
          return null;
        }
        return response.data as CountryDTO[];
      })
    );
  }


  GetCountryByCode(code: string): Observable<CountryDTO | null> {
    return this._countriesService.GetCountryByCode(code).pipe(
      map((response: ResponseDTO) => {
        if (!response.isSuccess) {
          this._notificationService.showToastErrorMessage(response.message!);
          return null;
        }
        return response.data as CountryDTO;
      })
    );
  }


  GetCountriesByRegion(region: string): Observable<CountryDTO[] | null> {
    return this._countriesService.GetCountriesByRegion(region).pipe(
      map((response: ResponseDTO) => {
        if (!response.isSuccess) {
          this._notificationService.showToastErrorMessage(response.message!);
          return null;
        }
        return response.data as CountryDTO[];
      })
    );
  }


  SearchCountriesByName(name: string): Observable<CountryDTO[] | null> {
    return this._countriesService.SearchCountriesByName(name).pipe(
      map((response: ResponseDTO) => {
        if (!response.isSuccess) {
          this._notificationService.showToastErrorMessage(response.message!);
          return null;
        }
        return response.data as CountryDTO[];
      })
    );
  }

  GetAvailableRegions(): Observable<string[] | null> {
    return this._countriesService.GetAvailableRegions().pipe(
      map((response: ResponseDTO) => {
        if (!response.isSuccess) {
          this._notificationService.showToastErrorMessage(response.message!);
          return null;
        }
        return response.data as string[];
      })
    );
  }


  SearchCountriesWithFilters(
    searchTerm: string,
    region?: string,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<PagedResultDTO<CountryDTO> | null> {
    const filters: CountryFilterDTO = {
      searchTerm,
      region,
      pageNumber,
      pageSize,
      sortBy: 'Name',
      ascending: true,
    };
    return this.GetCountriesPaged(filters);
  }

  GetCountriesByPopulation(
    ascending: boolean = false,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<PagedResultDTO<CountryDTO> | null> {
    const filters: CountryFilterDTO = {
      pageNumber,
      pageSize,
      sortBy: 'Population',
      ascending,
    };
    return this.GetCountriesPaged(filters);
  }


  GetCountriesByLanguage(
    language: string,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<PagedResultDTO<CountryDTO> | null> {
    const filters: CountryFilterDTO = {
      language,
      pageNumber,
      pageSize,
      sortBy: 'Name',
      ascending: true,
    };
    return this.GetCountriesPaged(filters);
  }
}