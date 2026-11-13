// src/app/services/access.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AccessService {
  private readonly key = 'access_granted';

  grant(): void { sessionStorage.setItem(this.key, '1'); }
  get granted(): boolean { return sessionStorage.getItem(this.key) === '1'; }
}