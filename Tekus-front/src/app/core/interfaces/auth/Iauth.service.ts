import { Observable } from 'rxjs';
import { ResponseDTO } from '../../data-transfer-object/common/response/response.dto';

export interface IAuthService {
  login(email: string, password: string): Observable<ResponseDTO>;
  isLoggedIn(): Observable<boolean>;
  validateCredentials(email: string, password: string): boolean;
  getRateLimitInfo(error: any): { retryAfter?: number; retryAfterMinutes?: number } | null;
}
