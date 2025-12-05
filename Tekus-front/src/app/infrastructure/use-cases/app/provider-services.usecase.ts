import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProviderServicesService } from '../../services/app/provider-services.service';
import { NotificationsService } from '../../services/notifications/notifications.service';
import { 
  AssignServiceToProviderDTO, 
  ProviderServiceResponseDTO 
} from '../../../core/data-transfer-object/app/provider-services.dto';
import { ResponseDTO } from '../../../core/data-transfer-object/common/response/response.dto';

@Injectable({
  providedIn: 'root',
})
export class ProviderServicesUseCase {
  constructor(
    private _providerServicesService: ProviderServicesService,
    private _notificationService: NotificationsService
  ) {}

  AssignServiceToProvider(
    assignment: AssignServiceToProviderDTO
  ): Observable<ProviderServiceResponseDTO | null> {
    return this._providerServicesService.AssignServiceToProvider(assignment).pipe(
      map((response: ResponseDTO) => {
        if (!response.isSuccess) {
          this._notificationService.showToastErrorMessage(response.message!);
          return null;
        }
        this._notificationService.showToastSuccessMessage(
          response.message || 'Service assigned to provider successfully.'
        );
        
        return response.data as ProviderServiceResponseDTO;
      })
    );
  }
}