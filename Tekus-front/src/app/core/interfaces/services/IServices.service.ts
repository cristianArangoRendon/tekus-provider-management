import { Observable } from 'rxjs';
import { ResponseDTO } from '../../data-transfer-object/common/response/response.dto';
import {
  GetServicesPagedDTO,
  CreateServiceDTO,
  UpdateServiceDTO,
} from '../../data-transfer-object/app/services.dto';

export interface IServicesService {
  GetServicesPaged(filters?: GetServicesPagedDTO): Observable<ResponseDTO>;
  CreateService(service: CreateServiceDTO): Observable<ResponseDTO>;
  UpdateService(service: UpdateServiceDTO): Observable<ResponseDTO>;
  DeleteService(serviceId: number): Observable<ResponseDTO>;
}