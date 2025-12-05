import { Observable } from 'rxjs';
import { ResponseDTO } from '../../data-transfer-object/common/response/response.dto';

export interface IDashboardService {
  GetDashboardSummary(): Observable<ResponseDTO>;
}