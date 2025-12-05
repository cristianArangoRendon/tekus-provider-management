import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardService } from '../../services/app/dashboard.service';
import { NotificationsService } from '../../services/notifications/notifications.service';
import { DashboardSummaryDTO } from '../../../core/data-transfer-object/app/dashboard.dto';
import { ResponseDTO } from '../../../core/data-transfer-object/common/response/response.dto';

@Injectable({
  providedIn: 'root',
})
export class DashboardUseCase {
  constructor(
    private _dashboardService: DashboardService,
    private _notificationService: NotificationsService
  ) {}

  GetDashboardSummary(): Observable<DashboardSummaryDTO | null> {
    return this._dashboardService.GetDashboardSummary().pipe(
      map((response: ResponseDTO) => {
        if (!response.isSuccess) {
          this._notificationService.showToastErrorMessage(response.message!);
          return null;
        }
        return response.data as DashboardSummaryDTO;
      })
    );
  }
}