import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {

  message: string | null = null;

  show(message: string, timeout = 3000): void {
    this.message = message;
    setTimeout(() => (this.message = null), timeout);
  }
}