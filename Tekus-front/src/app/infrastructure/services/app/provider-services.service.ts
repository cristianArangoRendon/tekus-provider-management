import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HttpService } from '../http-services/http.service';
import { ConfigService } from '../config/config.service';
import { AssignServiceToProviderDTO } from '../../../core/data-transfer-object/app/provider-services.dto';
import { ResponseDTO } from '../../../core/data-transfer-object/common/response/response.dto';
import { IProviderServicesService } from '../../../core/interfaces/services/IProvider.service';

@Injectable({
  providedIn: 'root',
})
export class ProviderServicesService implements IProviderServicesService {
  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService
  ) {}

   AssignServiceToProvider(assignment: AssignServiceToProviderDTO): Observable<ResponseDTO> {
    return this._configService.getUrlApplication().pipe(
      switchMap((url) => {
        return this._httpService.post(url, 'ProviderServices/assign', null,assignment);
      })
    );
  }
}