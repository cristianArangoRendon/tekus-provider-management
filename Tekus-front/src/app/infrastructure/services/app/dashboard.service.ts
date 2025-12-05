import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HttpService } from '../http-services/http.service';
import { ConfigService } from '../config/config.service';
import { IDashboardService } from '../../../core/interfaces/services/IDashboard.service';
import { ResponseDTO } from '../../../core/data-transfer-object/common/response/response.dto';

@Injectable({
  providedIn: 'root',
})
export class DashboardService implements IDashboardService {
  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService
  ) {}

  GetDashboardSummary(): Observable<ResponseDTO> {
    return this._configService.getUrlApplication().pipe(
      switchMap((url) => {
        return this._httpService.get(url, 'Dashboard/summary', null);
      })
    );
  }
}