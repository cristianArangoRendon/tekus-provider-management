
import { Observable } from 'rxjs';
import { CountryFilterDTO } from '../../data-transfer-object/app/countries.dto';
import { ResponseDTO } from '../../data-transfer-object/common/response/response.dto';

export interface ICountriesService {
  GetCountriesPaged(filters?: CountryFilterDTO): Observable<ResponseDTO>;
  GetAllCountries(): Observable<ResponseDTO>;
  GetCountryByCode(code: string): Observable<ResponseDTO>;
  GetCountriesByRegion(region: string): Observable<ResponseDTO>;
  SearchCountriesByName(name: string): Observable<ResponseDTO>;
  GetAvailableRegions(): Observable<ResponseDTO>;
}