import { Observable } from 'rxjs';
import { ResponseDTO } from '../../data-transfer-object/common/response/response.dto';

export interface IHttpService {
    get(urlService: string, endpoint: string, params?: any): Observable<ResponseDTO>;
    post(urlService: string, endpoint: string, params?: any, body?: any): Observable<ResponseDTO>;
    put(urlService: string, endpoint: string, params?: any, body?: any): Observable<ResponseDTO>;
    delete(urlService: string, endpoint: string, params?: any): Observable<ResponseDTO>;
}
