import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { AccessService } from '../../../../core/services/access.service';


type Status = 'idle' | 'checking' | 'error' | 'success';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SignInComponent implements OnDestroy {
  private readonly supabase = inject(SupabaseService);
  private readonly access = inject(AccessService);
  private readonly router = inject(Router);

  readonly unlockMs = 2200; // how long the "unlocking" moment lasts before the redirect
  code = '';
  readonly status = signal<Status>('idle');
  readonly message = signal('');
  readonly shaking = signal(false);
  private timer?: ReturnType<typeof setTimeout>;

  async submit(): Promise<void> {
    if (this.status() === 'checking') return;

    const value = this.code.trim();
    if (!value) return this.fail('> type the code first');

    this.status.set('checking');
    try {
      const ok = await this.supabase.verifyAccessCode(value);
      if (!ok) return this.fail('ACCESS DENIED > try again');

      this.access.grant();
      this.status.set('success');
      this.timer = setTimeout(() => this.router.navigateByUrl('/proposal'), this.unlockMs);
    } catch {
      this.fail('connection lost > try again');
    }
  }

  onInput(): void {
    if (this.status() === 'error') this.status.set('idle');
  }

  private fail(msg: string): void {
    this.message.set(msg);
    this.status.set('error');
    this.shaking.set(true);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }
}