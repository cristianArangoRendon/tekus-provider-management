import { Injectable, signal, computed } from '@angular/core';

@Injectable()
export class LoginStateService {
  private _isLoading = signal<boolean>(false);
  private _hasError = signal<boolean>(false);
  private _errorMessage = signal<string | null>(null);
  private _isSuccess = signal<boolean>(false);

  readonly isLoading = computed(() => this._isLoading());
  readonly hasErrors = computed(() => this._hasError());
  readonly errorMessage = computed(() => this._errorMessage());
  readonly isSuccess = computed(() => this._isSuccess());

  startLogin(): void {
    this._isLoading.set(true);
    this._hasError.set(false);
    this._errorMessage.set(null);
    this._isSuccess.set(false);
  }

  loginSuccess(): void {
    this._isLoading.set(false);
    this._hasError.set(false);
    this._errorMessage.set(null);
    this._isSuccess.set(true);
  }

  loginError(message: string): void {
    this._isLoading.set(false);
    this._hasError.set(true);
    this._errorMessage.set(message);
    this._isSuccess.set(false);
  }

  reset(): void {
    this._hasError.set(false);
    this._errorMessage.set(null);
  }

  clear(): void {
    this._isLoading.set(false);
    this._hasError.set(false);
    this._errorMessage.set(null);
    this._isSuccess.set(false);
  }
}
