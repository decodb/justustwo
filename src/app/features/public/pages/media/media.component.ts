import { Component, computed, HostListener, signal } from '@angular/core';

@Component({
  selector: 'app-media',
  imports: [],
  templateUrl: './media.component.html',
  styleUrl: './media.component.scss'
})
export class MediaComponent {
  readonly photos = [
    { src: 'picture1.jpg', caption: 'mrs mkhwanazi' },
    { src: 'picture2.jpg', caption: 'arghh' },
    { src: 'picture3.jpg', caption: 'mxm' },
    { src: 'picture4.jpg', caption: 'ehh' },
    { src: 'picture5.jpg', caption: 'some drawing' },
    { src: 'picture6.jpg', caption: 'final product' },
    { src: 'picture7.jpg', caption: 'haha' },
  ].map((photo) => ({
    ...photo,
    src: `assets/images/${photo.src}`,
  }));
  readonly total = this.photos.length;
 
  readonly index = signal(0);
  readonly dragX = signal(0);
  readonly dragging = signal(false);
 
  readonly isFirst = computed(() => this.index() === 0);
  readonly isLast = computed(() => this.index() === this.total - 1);
 
  private startX = 0;
 
  next(): void {
    if (!this.isLast()) this.index.update((i) => i + 1);
  }
 
  prev(): void {
    if (!this.isFirst()) this.index.update((i) => i - 1);
  }
 
  // ---- swipe / drag ----
  onDown(e: PointerEvent): void {
    this.dragging.set(true);
    this.startX = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
 
  onMove(e: PointerEvent): void {
    if (this.dragging()) this.dragX.set(e.clientX - this.startX);
  }
 
  onUp(): void {
    if (!this.dragging()) return;
    const dx = this.dragX();
    this.dragging.set(false);
    this.dragX.set(0);
    if (dx < -60) this.next();
    else if (dx > 60) this.prev();
  }
 
  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'ArrowLeft') this.prev();
  }
 
  // ---- stack position of each card, relative to the current one ----
  cardStyle(i: number): Record<string, string> {
    const offset = i - this.index();
    const rot = ((i * 37) % 9) - 4; // stable "messy pile" tilt between -4 and 4 degrees
 
    if (offset < 0) {
      // already seen: thrown off to the left
      return { transform: 'translateX(-140%) rotate(-20deg)', opacity: '0', zIndex: `${i}`, pointerEvents: 'none' };
    }
    if (offset === 0) {
      const dx = this.dragX();
      return { transform: `translateX(${dx}px) rotate(${dx * 0.06}deg)`, opacity: '1', zIndex: '100' };
    }
    if (offset > 3) {
      return { transform: 'translateY(40px) scale(0.85)', opacity: '0', zIndex: '0', pointerEvents: 'none' };
    }
    return {
      transform: `translate(${rot * 3}px, ${offset * 12}px) scale(${1 - offset * 0.04}) rotate(${rot}deg)`,
      opacity: '1',
      zIndex: `${100 - offset}`,
      pointerEvents: 'none',
    };
  }
}
