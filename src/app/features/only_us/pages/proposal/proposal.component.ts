import { Component, HostListener, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { SupabaseService } from '../../../../core/services/supabase.service';

type Answer = 'yes' | 'no';
type Phase = 'loading' | 'typing' | 'question' | 'sent';

@Component({
  selector: 'app-proposal',
  standalone: true,
  templateUrl: './proposal.component.html',
  styleUrl: './proposal.component.scss',
})
export class ProposalComponent implements OnInit, OnDestroy {
  private readonly supabase = inject(SupabaseService);
  private readonly storeKey = 'proposal_answer'; // clear this in localStorage to test again
  private skipped = false;
  private destroyed = false;
  private timer?: ReturnType<typeof setTimeout>;

  // ✏️ Edit your story here. Lines starting with ">" look like system messages.
  readonly lines = [
    '> decrypting file... 100%',
    '> file found: our_story.txt',
    'hey my love.',
    'from the first hello to every picture in our gallery,',
    'you have become my favourite part of every day.',
    'so i have one very important question for you...',
  ];
  readonly charMs = 32; // typing speed
  readonly lineMs = 500; // pause between lines

  // ✏️ What she sees after answering
  readonly yesBadge = 'PROPOSAL ACCEPTED ✓';
  readonly noBadge = 'PROPOSAL DECLINED';
  readonly yesTitle = 'you said yes 💗';
  readonly yesMessage = 'i love you, my girlfriend.';
  readonly noTitle = 'thank you for being honest';
  readonly noMessage = 'that took courage, and i respect it. whatever happens, you mean a lot to me.';

  readonly typed = signal<string[]>([]);
  readonly phase = signal<Phase>('loading');
  readonly choice = signal<Answer | null>(null); // answer waiting for "are you sure?"
  readonly result = signal<Answer | null>(null);
  readonly sending = signal(false);
  readonly error = signal('');

  readonly hearts = Array.from({ length: 16 }, (_, i) => ({
    left: (i * 37) % 100,
    size: 18 + ((i * 7) % 22),
    dur: 3 + (i % 5) * 0.6,
    delay: (i % 6) * 0.35,
  }));

  async ngOnInit(): Promise<void> {
    // Has she already answered (on any device)? Then show the result, never the buttons.
    const saved = await this.lookupAnswer();
    if (this.destroyed) return;
    if (saved) {
      this.typed.set([...this.lines]); // your message stays on the page, no typing animation
      this.result.set(saved);
      this.phase.set('sent');
      return;
    }

    this.phase.set('typing');
    await this.play();
    if (!this.destroyed && this.phase() === 'typing') this.phase.set('question');
  }

  // The database is the source of truth. Local storage is only a fallback if the network fails.
  private async lookupAnswer(): Promise<Answer | null> {
    try {
      const remote = await this.supabase.getResponse();
      try {
        if (remote) localStorage.setItem(this.storeKey, remote);
        else localStorage.removeItem(this.storeKey);
      } catch { /* ignore */ }
      return remote;
    } catch {
      try {
        const local = localStorage.getItem(this.storeKey);
        return local === 'yes' || local === 'no' ? local : null;
      } catch {
        return null;
      }
    }
  }

  skip(): void {
    this.skipped = true;
    clearTimeout(this.timer);
    this.typed.set([...this.lines]);
    this.phase.set('question');
  }

  pick(answer: Answer): void {
    this.error.set('');
    this.choice.set(answer);
  }

  cancel(): void {
    if (this.sending()) return;
    this.choice.set(null);
    this.error.set('');
  }

  async confirm(): Promise<void> {
    const answer = this.choice();
    if (!answer || this.sending()) return;

    this.sending.set(true);
    this.error.set('');
    try {
      const recorded = await this.supabase.submitResponse(answer);
      try { localStorage.setItem(this.storeKey, recorded); } catch { /* ignore */ }
      this.result.set(recorded);
      this.choice.set(null);
      this.phase.set('sent');
    } catch {
      this.error.set('could not send > check your connection and try again');
    } finally {
      this.sending.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cancel();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    clearTimeout(this.timer);
  }

  // ---- typewriter ----
  private async play(): Promise<void> {
    for (const line of this.lines) {
      this.typed.update((t) => [...t, '']);
      for (let i = 1; i <= line.length; i++) {
        if (this.skipped || this.destroyed) return;
        this.typed.update((t) => [...t.slice(0, -1), line.slice(0, i)]);
        await this.sleep(this.charMs);
      }
      await this.sleep(this.lineMs);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => (this.timer = setTimeout(resolve, ms)));
  }
}