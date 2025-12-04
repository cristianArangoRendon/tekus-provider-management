import { Observable } from 'rxjs';
import { ResponseDTO } from '../../data-transfer-object/common/response/response.dto';
import {
  GetProvidersPagedDTO,
  CreateProviderDTO,
  AddCustomFieldDTO,
} from '../../data-transfer-object/app/providers.dto';

export interface IProvidersService {
  GetProvidersPaged(filters?: GetProvidersPagedDTO): Observable<ResponseDTO>;
  CreateProvider(provider: CreateProviderDTO): Observable<ResponseDTO>;
  DeleteProvider(providerId: number): Observable<ResponseDTO>;
  AddCustomFieldToProvider(customField: AddCustomFieldDTO): Observable<ResponseDTO>;
}