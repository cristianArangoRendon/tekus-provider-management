import { Observable } from 'rxjs';
import { ResponseDTO } from '../../data-transfer-object/common/response/response.dto';
import { AssignServiceToProviderDTO } from '../../data-transfer-object/app/provider-services.dto';

export interface IProviderServicesService {
  AssignServiceToProvider(assignment: AssignServiceToProviderDTO): Observable<ResponseDTO>;
}